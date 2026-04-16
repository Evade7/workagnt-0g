// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {AgntMarketplace} from "../src/AgntMarketplace.sol";

contract DeployScript is Script {
    function run() external {
        uint256 key = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(key);
        AgntMarketplace marketplace = new AgntMarketplace();
        vm.stopBroadcast();
        console.log("AgntMarketplace:", address(marketplace));
    }
}
