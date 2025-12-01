// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OutcomeToken
 * @notice ERC1155 token representing YES/NO outcome shares in prediction markets
 * @dev Token IDs: marketId * 2 = YES, marketId * 2 + 1 = NO
 */
contract OutcomeToken is ERC1155, Ownable {
    // Mapping of authorized market contracts
    mapping(address => bool) public authorizedMarkets;
    
    // Market metadata
    mapping(uint256 => string) public marketQuestions;
    
    event MarketAuthorized(address indexed market, bool authorized);
    event TokensMinted(address indexed to, uint256 indexed tokenId, uint256 amount);
    event TokensBurned(address indexed from, uint256 indexed tokenId, uint256 amount);
    
    constructor() ERC1155("https://api.arcprediction.market/metadata/{id}.json") Ownable(msg.sender) {}
    
    /**
     * @notice Authorize or deauthorize a market contract
     * @param market Address of the market contract
     * @param authorized Whether the market is authorized
     */
    function setMarketAuthorization(address market, bool authorized) external onlyOwner {
        authorizedMarkets[market] = authorized;
        emit MarketAuthorized(market, authorized);
    }
    
    /**
     * @notice Mint outcome tokens (only callable by authorized markets)
     * @param to Recipient address
     * @param tokenId Token ID (marketId * 2 for YES, marketId * 2 + 1 for NO)
     * @param amount Amount to mint
     */
    function mint(address to, uint256 tokenId, uint256 amount) external {
        require(authorizedMarkets[msg.sender], "OutcomeToken: caller not authorized");
        _mint(to, tokenId, amount, "");
        emit TokensMinted(to, tokenId, amount);
    }
    
    /**
     * @notice Burn outcome tokens (only callable by authorized markets)
     * @param from Address to burn from
     * @param tokenId Token ID
     * @param amount Amount to burn
     */
    function burn(address from, uint256 tokenId, uint256 amount) external {
        require(authorizedMarkets[msg.sender], "OutcomeToken: caller not authorized");
        _burn(from, tokenId, amount);
        emit TokensBurned(from, tokenId, amount);
    }
    
    /**
     * @notice Get YES token ID for a market
     * @param marketId Market ID
     * @return Token ID for YES outcome
     */
    function getYesTokenId(uint256 marketId) public pure returns (uint256) {
        return marketId * 2;
    }
    
    /**
     * @notice Get NO token ID for a market
     * @param marketId Market ID
     * @return Token ID for NO outcome
     */
    function getNoTokenId(uint256 marketId) public pure returns (uint256) {
        return marketId * 2 + 1;
    }
    
    /**
     * @notice Set market question for metadata
     * @param marketId Market ID
     * @param question Market question
     */
    function setMarketQuestion(uint256 marketId, string memory question) external {
        require(authorizedMarkets[msg.sender], "OutcomeToken: caller not authorized");
        marketQuestions[marketId] = question;
    }
}
