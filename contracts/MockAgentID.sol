// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockAgentID — TEST-ONLY stand-in for the official Agent ID contract.
/// @notice Used exclusively on local chains and BSC testnet so AgentBoard's
///         gating logic can be exercised end-to-end. On mainnet, AgentBoard
///         is deployed against the real Agent ID contract
///         0x60b9262456de011f7d15a54cdd8c48baaa8b022f instead.
///         Anyone can register one handle for their own address here; handles
///         are unique. This contract is never deployed to mainnet.
contract MockAgentID {
    mapping(address => string) private _handleOf;
    mapping(string => address) private _ownerOfHandle;
    mapping(address => uint256) private _balanceOf;

    function register(string calldata handle) external {
        require(bytes(handle).length >= 2 && bytes(handle).length <= 32, "bad length");
        require(_ownerOfHandle[handle] == address(0), "handle taken");
        require(_balanceOf[msg.sender] == 0, "one per address");
        _handleOf[msg.sender] = handle;
        _ownerOfHandle[handle] = msg.sender;
        _balanceOf[msg.sender] = 1;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balanceOf[owner];
    }

    function handleOf(address owner) external view returns (string memory) {
        return _handleOf[owner];
    }

    function ownerOfHandle(string memory handle) external view returns (address) {
        return _ownerOfHandle[handle];
    }
}
