pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract ERC20StablePermit is ERC20PresetMinterPauser, ERC20Permit {

    /**
     * @dev Allows overriding the name, symbol & decimal of the base ERC20 contract
     */
    constructor(string memory name, string memory symbol) public ERC20PresetMinterPauser(name, symbol) ERC20Permit(name) {
    }
    
    /// @dev ERC20Stable is changed precision to 6 decimals
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20PresetMinterPauser) {
        super._beforeTokenTransfer(from, to, amount);
    }
}