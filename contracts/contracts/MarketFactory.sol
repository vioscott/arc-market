// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Market.sol";
import "./OutcomeToken.sol";

/**
 * @title MarketFactory
 * @notice Factory contract for creating and managing prediction markets
 */
contract MarketFactory is Ownable {
    using Clones for address;

    // Market registry
    Market[] public markets;
    mapping(address => bool) public isMarket;
    
    // Configuration
    address public immutable usdc;
    address public immutable outcomeToken;
    address public oracle;
    address public immutable marketImplementation; // Master implementation
    uint256 public minLiquidityParameter;
    uint256 public marketCreationFee;
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed marketAddress,
        address indexed creator,
        string question,
        uint256 closeTime
    );
    event OracleUpdated(address indexed newOracle);
    event MinLiquidityParameterUpdated(uint256 newMin);
    event MarketCreationFeeUpdated(uint256 newFee);
    
    constructor(
        address _usdc,
        address _outcomeToken,
        address _oracle,
        uint256 _minLiquidityParameter
    ) Ownable(msg.sender) {
        require(_usdc != address(0), "MarketFactory: invalid USDC address");
        require(_outcomeToken != address(0), "MarketFactory: invalid outcome token address");
        require(_oracle != address(0), "MarketFactory: invalid oracle address");
        
        usdc = _usdc;
        outcomeToken = _outcomeToken;
        oracle = _oracle;
        minLiquidityParameter = _minLiquidityParameter;
        
        // Deploy master implementation
        marketImplementation = address(new Market(_oracle, _usdc, _outcomeToken));
    }
    
    /**
     * @notice Create a new prediction market
     * @param question Market question
     * @param sourceUrl Source URL for event verification
     * @param closeTime When the market closes for trading
     * @param liquidityParameter LMSR liquidity parameter (b)
     * @return marketAddress Address of the created market
     */
    function createMarket(
        string memory question,
        string memory sourceUrl,
        uint256 closeTime,
        uint256 liquidityParameter
    ) external payable returns (address marketAddress) {
        require(bytes(question).length > 0, "MarketFactory: empty question");
        require(closeTime > block.timestamp, "MarketFactory: invalid close time");
        require(liquidityParameter >= minLiquidityParameter, "MarketFactory: liquidity too low");
        require(msg.value >= marketCreationFee, "MarketFactory: insufficient fee");
        
        uint256 marketId = markets.length;
        
        // Deploy new market via Clone
        marketAddress = marketImplementation.clone();
        Market(marketAddress).initialize(
            marketId,
            question,
            sourceUrl,
            closeTime,
            liquidityParameter,
            msg.sender
        );
        
        markets.push(Market(marketAddress));
        isMarket[marketAddress] = true;
        
        // Authorize market to mint/burn outcome tokens
        OutcomeToken(outcomeToken).setMarketAuthorization(marketAddress, true);
        OutcomeToken(outcomeToken).setMarketQuestion(marketId, question);
        
        emit MarketCreated(marketId, marketAddress, msg.sender, question, closeTime);
        
        return marketAddress;
    }
    
    /**
     * @notice Get total number of markets
     */
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }
    
    /**
     * @notice Get market address by ID
     */
    function getMarket(uint256 marketId) external view returns (address) {
        require(marketId < markets.length, "MarketFactory: invalid market ID");
        return address(markets[marketId]);
    }
    
    /**
     * @notice Get all markets (paginated)
     * @param offset Starting index
     * @param limit Number of markets to return
     */
    function getMarkets(uint256 offset, uint256 limit) external view returns (address[] memory) {
        require(offset < markets.length, "MarketFactory: offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > markets.length) {
            end = markets.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = address(markets[i]);
        }
        
        return result;
    }
    
    /**
     * @notice Update oracle address
     */
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "MarketFactory: invalid oracle");
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }
    
    /**
     * @notice Update minimum liquidity parameter
     */
    function setMinLiquidityParameter(uint256 _minLiquidityParameter) external onlyOwner {
        minLiquidityParameter = _minLiquidityParameter;
        emit MinLiquidityParameterUpdated(_minLiquidityParameter);
    }
    
    /**
     * @notice Update market creation fee
     */
    function setMarketCreationFee(uint256 _fee) external onlyOwner {
        marketCreationFee = _fee;
        emit MarketCreationFeeUpdated(_fee);
    }
    
    /**
     * @notice Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "MarketFactory: no fees to withdraw");
        payable(owner()).transfer(balance);
    }
}
