// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Market.sol";

/**
 * @title Oracle
 * @notice Multi-signature oracle for resolving prediction markets
 * @dev Implements time-lock and dispute mechanism for secure resolution
 */
contract Oracle is AccessControl {
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Resolution states
    enum ResolutionState { None, Proposed, Confirmed, Disputed, Finalized }
    
    struct Resolution {
        uint8 outcome;
        uint256 proposedAt;
        uint256 confirmations;
        ResolutionState state;
        mapping(address => bool) hasConfirmed;
    }
    
    // Market resolutions
    mapping(address => Resolution) public resolutions;
    
    // Configuration
    uint256 public requiredConfirmations;
    uint256 public timeLockDuration;
    uint256 public disputePeriod;
    
    event ResolutionProposed(address indexed market, uint8 outcome, address indexed proposer);
    event ResolutionConfirmed(address indexed market, address indexed confirmer);
    event ResolutionFinalized(address indexed market, uint8 outcome);
    event ResolutionDisputed(address indexed market, address indexed disputer);
    event ConfigurationUpdated(uint256 requiredConfirmations, uint256 timeLockDuration, uint256 disputePeriod);
    
    constructor(
        address[] memory resolvers,
        uint256 _requiredConfirmations,
        uint256 _timeLockDuration,
        uint256 _disputePeriod
    ) {
        require(resolvers.length >= _requiredConfirmations, "Oracle: insufficient resolvers");
        require(_requiredConfirmations > 0, "Oracle: invalid confirmations");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        for (uint256 i = 0; i < resolvers.length; i++) {
            _grantRole(RESOLVER_ROLE, resolvers[i]);
        }
        
        requiredConfirmations = _requiredConfirmations;
        timeLockDuration = _timeLockDuration;
        disputePeriod = _disputePeriod;
    }
    
    /**
     * @notice Propose a resolution for a market
     * @param market Market address
     * @param outcome Outcome to resolve to (0=YES, 1=NO, 2=Invalid)
     */
    function proposeResolution(address market, uint8 outcome) external onlyRole(RESOLVER_ROLE) {
        require(outcome <= 2, "Oracle: invalid outcome");
        
        Resolution storage resolution = resolutions[market];
        require(resolution.state == ResolutionState.None, "Oracle: resolution already exists");
        
        resolution.outcome = outcome;
        resolution.proposedAt = block.timestamp;
        resolution.state = ResolutionState.Proposed;
        resolution.confirmations = 1;
        resolution.hasConfirmed[msg.sender] = true;
        
        emit ResolutionProposed(market, outcome, msg.sender);
        
        // Auto-confirm if only 1 confirmation needed
        if (requiredConfirmations == 1) {
            resolution.state = ResolutionState.Confirmed;
        }
    }
    
    /**
     * @notice Confirm a proposed resolution
     * @param market Market address
     */
    function confirmResolution(address market) external onlyRole(RESOLVER_ROLE) {
        Resolution storage resolution = resolutions[market];
        require(resolution.state == ResolutionState.Proposed, "Oracle: not in proposed state");
        require(!resolution.hasConfirmed[msg.sender], "Oracle: already confirmed");
        
        resolution.hasConfirmed[msg.sender] = true;
        resolution.confirmations++;
        
        emit ResolutionConfirmed(market, msg.sender);
        
        // Move to confirmed state if threshold reached
        if (resolution.confirmations >= requiredConfirmations) {
            resolution.state = ResolutionState.Confirmed;
        }
    }
    
    /**
     * @notice Finalize a resolution after time-lock
     * @param market Market address
     */
    function finalizeResolution(address market) external {
        Resolution storage resolution = resolutions[market];
        require(resolution.state == ResolutionState.Confirmed, "Oracle: not confirmed");
        require(
            block.timestamp >= resolution.proposedAt + timeLockDuration,
            "Oracle: time-lock not expired"
        );
        require(
            block.timestamp < resolution.proposedAt + timeLockDuration + disputePeriod,
            "Oracle: dispute period expired"
        );
        
        resolution.state = ResolutionState.Finalized;
        
        // Resolve the market
        Market(market).resolve(resolution.outcome);
        
        emit ResolutionFinalized(market, resolution.outcome);
    }
    
    /**
     * @notice Dispute a resolution (admin only)
     * @param market Market address
     */
    function disputeResolution(address market) external onlyRole(ADMIN_ROLE) {
        Resolution storage resolution = resolutions[market];
        require(
            resolution.state == ResolutionState.Confirmed || resolution.state == ResolutionState.Proposed,
            "Oracle: cannot dispute"
        );
        
        resolution.state = ResolutionState.Disputed;
        
        emit ResolutionDisputed(market, msg.sender);
    }
    
    /**
     * @notice Reset a disputed resolution
     * @param market Market address
     */
    function resetResolution(address market) external onlyRole(ADMIN_ROLE) {
        Resolution storage resolution = resolutions[market];
        require(resolution.state == ResolutionState.Disputed, "Oracle: not disputed");
        
        delete resolutions[market];
    }
    
    /**
     * @notice Emergency resolution (requires admin role)
     * @param market Market address
     * @param outcome Outcome to resolve to
     */
    function emergencyResolve(address market, uint8 outcome) external onlyRole(ADMIN_ROLE) {
        require(outcome <= 2, "Oracle: invalid outcome");
        
        Resolution storage resolution = resolutions[market];
        resolution.outcome = outcome;
        resolution.state = ResolutionState.Finalized;
        
        Market(market).resolve(outcome);
        
        emit ResolutionFinalized(market, outcome);
    }
    
    /**
     * @notice Update configuration
     */
    function updateConfiguration(
        uint256 _requiredConfirmations,
        uint256 _timeLockDuration,
        uint256 _disputePeriod
    ) external onlyRole(ADMIN_ROLE) {
        require(_requiredConfirmations > 0, "Oracle: invalid confirmations");
        
        requiredConfirmations = _requiredConfirmations;
        timeLockDuration = _timeLockDuration;
        disputePeriod = _disputePeriod;
        
        emit ConfigurationUpdated(_requiredConfirmations, _timeLockDuration, _disputePeriod);
    }
    
    /**
     * @notice Get resolution details
     */
    function getResolution(address market) external view returns (
        uint8 outcome,
        uint256 proposedAt,
        uint256 confirmations,
        ResolutionState state
    ) {
        Resolution storage resolution = resolutions[market];
        return (
            resolution.outcome,
            resolution.proposedAt,
            resolution.confirmations,
            resolution.state
        );
    }
}
