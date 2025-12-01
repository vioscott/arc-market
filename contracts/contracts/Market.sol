// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./OutcomeToken.sol";

/**
 * @title Market
 * @notice Prediction market with LMSR automated market maker
 * @dev Implements Logarithmic Market Scoring Rule for pricing
 */
contract Market is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Market states
    enum MarketState { Active, Closed, Resolved }
    
    // Market configuration
    uint256 public immutable marketId;
    string public question;
    string public sourceUrl;
    uint256 public closeTime;
    uint256 public createdAt;
    address public creator;
    
    // LMSR parameters
    uint256 public liquidityParameter; // 'b' in LMSR formula (scaled by 1e18)
    uint256 public yesShares; // Outstanding YES shares
    uint256 public noShares; // Outstanding NO shares
    
    // Resolution
    MarketState public state;
    uint8 public winningOutcome; // 0 = YES, 1 = NO, 2 = Invalid
    address public oracle;
    
    // Contracts
    IERC20 public immutable usdc;
    OutcomeToken public immutable outcomeToken;
    
    // Constants
    uint256 private constant PRECISION = 1e18;
    uint256 private constant MAX_SHARES = 1e12 * 1e18; // Prevent overflow
    
    event SharesPurchased(address indexed buyer, uint8 outcome, uint256 shares, uint256 cost);
    event SharesSold(address indexed seller, uint8 outcome, uint256 shares, uint256 payout);
    event MarketResolved(uint8 winningOutcome);
    event SharesRedeemed(address indexed user, uint256 shares, uint256 payout);
    
    constructor(
        uint256 _marketId,
        string memory _question,
        string memory _sourceUrl,
        uint256 _closeTime,
        uint256 _liquidityParameter,
        address _creator,
        address _oracle,
        address _usdc,
        address _outcomeToken
    ) {
        require(_closeTime > block.timestamp, "Market: close time must be in future");
        require(_liquidityParameter > 0, "Market: liquidity parameter must be positive");
        
        marketId = _marketId;
        question = _question;
        sourceUrl = _sourceUrl;
        closeTime = _closeTime;
        liquidityParameter = _liquidityParameter;
        creator = _creator;
        oracle = _oracle;
        usdc = IERC20(_usdc);
        outcomeToken = OutcomeToken(_outcomeToken);
        createdAt = block.timestamp;
        state = MarketState.Active;
    }
    
    /**
     * @notice Calculate cost to buy shares using LMSR
     * @param outcome 0 for YES, 1 for NO
     * @param amount Number of shares to buy
     * @return cost Cost in USDC (scaled by 1e6)
     */
    function calculateCost(uint8 outcome, uint256 amount) public view returns (uint256) {
        require(outcome <= 1, "Market: invalid outcome");
        require(amount > 0, "Market: amount must be positive");
        
        uint256 currentYes = yesShares;
        uint256 currentNo = noShares;
        
        // Calculate cost before and after purchase
        uint256 costBefore = _lmsrCost(currentYes, currentNo);
        
        if (outcome == 0) {
            currentYes += amount;
        } else {
            currentNo += amount;
        }
        
        require(currentYes < MAX_SHARES && currentNo < MAX_SHARES, "Market: max shares exceeded");
        
        uint256 costAfter = _lmsrCost(currentYes, currentNo);
        
        // Convert from 1e18 to 1e6 (USDC decimals)
        return (costAfter - costBefore) / 1e12;
    }
    
    /**
     * @notice Calculate payout for selling shares using LMSR
     * @param outcome 0 for YES, 1 for NO
     * @param amount Number of shares to sell
     * @return payout Payout in USDC (scaled by 1e6)
     */
    function calculatePayout(uint8 outcome, uint256 amount) public view returns (uint256) {
        require(outcome <= 1, "Market: invalid outcome");
        require(amount > 0, "Market: amount must be positive");
        
        uint256 currentYes = yesShares;
        uint256 currentNo = noShares;
        
        // Ensure sufficient shares exist
        if (outcome == 0) {
            require(currentYes >= amount, "Market: insufficient YES shares");
        } else {
            require(currentNo >= amount, "Market: insufficient NO shares");
        }
        
        // Calculate cost before and after sale
        uint256 costBefore = _lmsrCost(currentYes, currentNo);
        
        if (outcome == 0) {
            currentYes -= amount;
        } else {
            currentNo -= amount;
        }
        
        uint256 costAfter = _lmsrCost(currentYes, currentNo);
        
        // Convert from 1e18 to 1e6 (USDC decimals)
        return (costBefore - costAfter) / 1e12;
    }
    
    /**
     * @notice Buy outcome shares
     * @param outcome 0 for YES, 1 for NO
     * @param amount Number of shares to buy
     * @param maxCost Maximum cost willing to pay (slippage protection)
     */
    function buyShares(uint8 outcome, uint256 amount, uint256 maxCost) external nonReentrant {
        require(state == MarketState.Active, "Market: not active");
        require(block.timestamp < closeTime, "Market: market closed");
        
        uint256 cost = calculateCost(outcome, amount);
        require(cost <= maxCost, "Market: cost exceeds max");
        
        // Update shares
        if (outcome == 0) {
            yesShares += amount;
        } else {
            noShares += amount;
        }
        
        // Transfer USDC from buyer
        usdc.safeTransferFrom(msg.sender, address(this), cost);
        
        // Mint outcome tokens
        uint256 tokenId = outcome == 0 
            ? outcomeToken.getYesTokenId(marketId)
            : outcomeToken.getNoTokenId(marketId);
        outcomeToken.mint(msg.sender, tokenId, amount);
        
        emit SharesPurchased(msg.sender, outcome, amount, cost);
    }
    
    /**
     * @notice Sell outcome shares
     * @param outcome 0 for YES, 1 for NO
     * @param amount Number of shares to sell
     * @param minPayout Minimum payout to accept (slippage protection)
     */
    function sellShares(uint8 outcome, uint256 amount, uint256 minPayout) external nonReentrant {
        require(state == MarketState.Active, "Market: not active");
        
        uint256 payout = calculatePayout(outcome, amount);
        require(payout >= minPayout, "Market: payout below min");
        
        // Update shares
        if (outcome == 0) {
            yesShares -= amount;
        } else {
            noShares -= amount;
        }
        
        // Burn outcome tokens
        uint256 tokenId = outcome == 0 
            ? outcomeToken.getYesTokenId(marketId)
            : outcomeToken.getNoTokenId(marketId);
        outcomeToken.burn(msg.sender, tokenId, amount);
        
        // Transfer USDC to seller
        usdc.safeTransfer(msg.sender, payout);
        
        emit SharesSold(msg.sender, outcome, amount, payout);
    }
    
    /**
     * @notice Get current price for an outcome
     * @param outcome 0 for YES, 1 for NO
     * @return price Price between 0 and 1 (scaled by 1e18)
     */
    function getPrice(uint8 outcome) public view returns (uint256) {
        require(outcome <= 1, "Market: invalid outcome");
        
        if (yesShares == 0 && noShares == 0) {
            return PRECISION / 2; // 0.5 if no trades yet
        }
        
        // Price = e^(q_i/b) / (e^(q_yes/b) + e^(q_no/b))
        uint256 shares = outcome == 0 ? yesShares : noShares;
        uint256 expShares = _exp((shares * PRECISION) / liquidityParameter);
        uint256 expYes = _exp((yesShares * PRECISION) / liquidityParameter);
        uint256 expNo = _exp((noShares * PRECISION) / liquidityParameter);
        
        return (expShares * PRECISION) / (expYes + expNo);
    }
    
    /**
     * @notice Resolve the market (oracle only)
     * @param _winningOutcome 0 = YES, 1 = NO, 2 = Invalid
     */
    function resolve(uint8 _winningOutcome) external {
        require(msg.sender == oracle, "Market: only oracle");
        require(state == MarketState.Active || state == MarketState.Closed, "Market: already resolved");
        require(_winningOutcome <= 2, "Market: invalid outcome");
        
        state = MarketState.Resolved;
        winningOutcome = _winningOutcome;
        
        emit MarketResolved(_winningOutcome);
    }
    
    /**
     * @notice Redeem winning shares for USDC
     * @param amount Number of winning shares to redeem
     */
    function redeemShares(uint256 amount) external nonReentrant {
        require(state == MarketState.Resolved, "Market: not resolved");
        require(winningOutcome <= 1, "Market: invalid resolution");
        
        uint256 tokenId = winningOutcome == 0 
            ? outcomeToken.getYesTokenId(marketId)
            : outcomeToken.getNoTokenId(marketId);
        
        // Burn winning tokens
        outcomeToken.burn(msg.sender, tokenId, amount);
        
        // Transfer 1 USDC per share (scaled to 1e6)
        uint256 payout = amount / 1e12; // Convert from 1e18 to 1e6
        usdc.safeTransfer(msg.sender, payout);
        
        emit SharesRedeemed(msg.sender, amount, payout);
    }
    
    /**
     * @notice Close market (can only trade until close time)
     */
    function closeMarket() external {
        require(block.timestamp >= closeTime, "Market: not yet closeable");
        require(state == MarketState.Active, "Market: not active");
        state = MarketState.Closed;
    }
    
    /**
     * @dev LMSR cost function: C(q) = b * ln(e^(q_yes/b) + e^(q_no/b))
     * @param qYes Outstanding YES shares
     * @param qNo Outstanding NO shares
     * @return cost Total cost (scaled by 1e18)
     */
    function _lmsrCost(uint256 qYes, uint256 qNo) private view returns (uint256) {
        if (qYes == 0 && qNo == 0) {
            return 0;
        }
        
        // Calculate e^(q_yes/b) and e^(q_no/b)
        uint256 expYes = _exp((qYes * PRECISION) / liquidityParameter);
        uint256 expNo = _exp((qNo * PRECISION) / liquidityParameter);
        
        // ln(expYes + expNo)
        uint256 sum = expYes + expNo;
        uint256 lnSum = _ln(sum);
        
        // b * ln(sum)
        return (liquidityParameter * lnSum) / PRECISION;
    }
    
    /**
     * @dev Approximate e^x using Taylor series (for small x)
     * @param x Input (scaled by 1e18)
     * @return result e^x (scaled by 1e18)
     */
    function _exp(uint256 x) private pure returns (uint256) {
        // For x > 10, use approximation to prevent overflow
        if (x > 10 * PRECISION) {
            return type(uint256).max / 1e18;
        }
        
        // Taylor series: e^x = 1 + x + x^2/2! + x^3/3! + ...
        uint256 result = PRECISION;
        uint256 term = PRECISION;
        
        for (uint256 i = 1; i <= 20; i++) {
            term = (term * x) / (i * PRECISION);
            result += term;
            if (term < 1) break;
        }
        
        return result;
    }
    
    /**
     * @dev Approximate ln(x) using series expansion
     * @param x Input (scaled by 1e18)
     * @return result ln(x) (scaled by 1e18)
     */
    function _ln(uint256 x) private pure returns (uint256) {
        require(x > 0, "Market: ln(0) undefined");
        
        if (x == PRECISION) return 0;
        
        // For x close to 1, use Taylor series: ln(1+y) = y - y^2/2 + y^3/3 - ...
        if (x < 2 * PRECISION && x > PRECISION / 2) {
            int256 y = int256(x) - int256(PRECISION);
            int256 result = 0;
            int256 term = y;
            
            for (uint256 i = 1; i <= 20; i++) {
                result += term / int256(i);
                term = -(term * y) / int256(PRECISION);
                if (term == 0) break;
            }
            
            return uint256(result);
        }
        
        // For other values, use bit-shift approximation
        uint256 result = 0;
        uint256 y = x;
        
        while (y >= 2 * PRECISION) {
            result += PRECISION * 693147180559945309 / 1e18; // ln(2)
            y /= 2;
        }
        
        while (y <= PRECISION / 2) {
            result -= PRECISION * 693147180559945309 / 1e18; // ln(2)
            y *= 2;
        }
        
        // Fine-tune with Taylor series
        int256 z = int256(y) - int256(PRECISION);
        int256 term = z;
        int256 adjustment = 0;
        
        for (uint256 i = 1; i <= 10; i++) {
            adjustment += term / int256(i);
            term = -(term * z) / int256(PRECISION);
        }
        
        return result + uint256(adjustment);
    }
}
