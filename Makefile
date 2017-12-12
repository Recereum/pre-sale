.PHONY: deps abi bin source build testrpc test

deps:
	npm install

abi:
	solc zeppelin-solidity=$(shell pwd -P)/node_modules/zeppelin-solidity/ contracts/RecereumToken.sol --abi | grep ":RecereumToken " -A2 | tail -n1 > build/RecereumToken.abi
	solc zeppelin-solidity=$(shell pwd -P)/node_modules/zeppelin-solidity/ contracts/RecereumPreSale.sol --abi | grep ":RecereumPreSale " -A2 | tail -n1 > build/RecereumPreSale.abi

bin:
	solc zeppelin-solidity=$(shell pwd -P)/node_modules/zeppelin-solidity/ contracts/RecereumToken.sol --bin | grep ":RecereumToken " -A2 | tail -n1 > build/RecereumToken.bin
	solc zeppelin-solidity=$(shell pwd -P)/node_modules/zeppelin-solidity/ contracts/RecereumPreSale.sol --bin | grep ":RecereumPreSale " -A2 | tail -n1 > build/RecereumPreSale.bin


merge:
	if [ ! -e build ]; then mkdir build; fi; node_modules/sol-merger/bin/sol-merger.js "contracts/*.sol" var/build
	cp var/build/*.sol build

testrpc:
	node_modules/.bin/testrpc -p 8544 \
		--account="0x7e9a1de56cce758c544ba5dea3a6347a4a01c453d81edc32c2385e9767f29501, 1000000000000000000000000000" \
		--account="0xf2029a2f20a9f57cd1a9a2a44c63d0c875f906c646f333b028cb6f1c38ef7db2, 1000000000000000000000000000" \
		--account="0x84f24b0dddc8262675927168bbbf8688f846bcaedc2618ae576d34c043401713, 1000000000000000000000000000" \
		--account="0x1fdc76364db4a4bcfad8f2c010995a96fcb98a165e34858665a234ba54715204, 1000000000000000000000000000" \
		--account="0x1fdc76364db4a4bcfad8f2c010995a96fcb98a165e34858665a234ba54715205, 1000000000000000000000000000" \
		--account="0x1fdc76364db4a4bcfad8f2c010995a96fcb98a165e34858665a234ba54715126, 1000000000000000000000000000" \
		--account="0x1fdc76364db4a4bcfad8f2c010995a96fcb98a165e34858665a234ba54715107, 1000000000000000000000000000" \

test:
	node_modules/.bin/truffle test
