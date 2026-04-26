# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.6](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@3.0.5...yarn-tool@3.0.6) (2026-04-26)

**Note:** Version bump only for package yarn-tool





## [3.0.5](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@3.0.3...yarn-tool@3.0.5) (2026-04-26)



### 📌　Dependencies

* update deps ([e6d11d2](https://github.com/bluelovers/yarn-tool/commit/e6d11d217a37c825aab86324413f033bbe3929db))



## [3.0.3](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@3.0.2...yarn-tool@3.0.3) (2026-03-12)



### ♻️　Chores

* **deps:** bump dependencies and update pnpm-lock.yaml ([48c6d74](https://github.com/bluelovers/yarn-tool/commit/48c6d744acfb286e6db7c189681a29e42b945814))



## [3.0.2](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@2.2.4...yarn-tool@3.0.2) (2026-03-10)


### BREAKING CHANGES

* 更新 README 與 package.json 以反映 v3+ 的 pnpm 支援
* 指令現在預設支援 pnpm，需透過 --npmClients 指定使用的套件管理器
* 指令現在預設優先使用 pnpm，若要使用 yarn 需明確指定 `--npmClients yarn` 或確保系統中無 pnpm
* disable locale setting in yarn-tool for speed up



### 🐛　Bug Fixes

* **deps:** 將 findRoot 改為直接從 @yarn-tool/find-root 匯入 ([2c48f76](https://github.com/bluelovers/yarn-tool/commit/2c48f7617b526cf5fa515c1f9c481043b9038290))
* **install:** 新增 --reset-lockfile 選項支援 pnpm ([11d1a01](https://github.com/bluelovers/yarn-tool/commit/11d1a018e596507167507b5e6da40debc49d92b0))


### 📦　Code Refactoring

* 新增 pnpm 支援並重構指令以支援動態套件管理器偵測 ([74f245c](https://github.com/bluelovers/yarn-tool/commit/74f245cfefb08b423c6afc956801ab36210000ca))


### 📚　Documentation

* 更新 README 與 package.json 以反映 v3+ 的 pnpm 支援 ([25ea228](https://github.com/bluelovers/yarn-tool/commit/25ea228fbefd5c3e44469e903207095dca1a430f))


### 🛠　Build System

* 新增 pnpm 支援並重構指令以支援動態套件管理器偵測 ([eb52402](https://github.com/bluelovers/yarn-tool/commit/eb52402f05c17ea6697feda63ace08037bf5f4e7))
* **install:** 新增 --reset-lockfile 選項支援 pnpm ([9ee2c2f](https://github.com/bluelovers/yarn-tool/commit/9ee2c2fcd5460bc3204ce70b0cf02278bc8df051))


### ♻️　Chores

* disable locale setting in yarn-tool for speed up ([a6f6112](https://github.com/bluelovers/yarn-tool/commit/a6f6112c8303f3ec344951fae0b22fcf05ea96df))



## [2.2.4](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@2.2.2...yarn-tool@2.2.4) (2026-03-10)


### BREAKING CHANGES

* **i18n:** 移除 lib/index.ts 的預設匯出 (default export)，請改用命名匯出



### ✨　Features

* **i18n:** 新增 CLI 命令描述的中文翻譯 ([73047cd](https://github.com/bluelovers/yarn-tool/commit/73047cd18551a7bcd2651bec10c46444bdf66807))


### 📦　Code Refactoring

* remove unused library modules and update imports ([57a1003](https://github.com/bluelovers/yarn-tool/commit/57a1003909c9074fe885173fb9290c93648025b0))


### 📚　Documentation

* add JSDoc documentation comments to command modules and core libraries ([6e911ee](https://github.com/bluelovers/yarn-tool/commit/6e911ee5ecf0a8716a98f3e389e540600bb7de1b))
* **i18n:** 新增 CLI 選項描述的中文翻譯 ([e0d9ea1](https://github.com/bluelovers/yarn-tool/commit/e0d9ea1611016dc5c185a7170526fc5ac37e47c6))


### 🛠　Build System

* update build ([b32812a](https://github.com/bluelovers/yarn-tool/commit/b32812a0069cca9c14344354e86c167136953526))


### ♻️　Chores

* **deps:** update dependencies and include `tsx` support check in CLI startup logic, bump version to 2.2.3 ([647075b](https://github.com/bluelovers/yarn-tool/commit/647075b314a52a920866133d42ec69e09468ae03))


### 🔖　Miscellaneous

* . ([8b4a922](https://github.com/bluelovers/yarn-tool/commit/8b4a92268491cea9bb93549ffa8bdddc07fc5f45))



## [2.2.2](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@2.1.6...yarn-tool@2.2.2) (2026-03-02)


### BREAKING CHANGES

* **deps:** 移除 v8-compile-cache 並更新 string-natural-compare 引入來源



### 🛠　Build System

* update build ([dd48b72](https://github.com/bluelovers/yarn-tool/commit/dd48b7252fc8d3ab781800c039de43b781654ab0))
* **scripts:** 停用 prepublish 自動安裝功能 ([e5c8a5b](https://github.com/bluelovers/yarn-tool/commit/e5c8a5b7e6677fdddc8a6a45a46ef53b5773f5e9))


### ♻️　Chores

* **deps:** 更新依賴項目並升級版本至 2.2.0 ([d4852b4](https://github.com/bluelovers/yarn-tool/commit/d4852b44ba35539d9a597fae9dfbcf5b421ffa5b))
* **deps:** 移除 v8-compile-cache 並更新 string-natural-compare 引入來源 ([bfab1ea](https://github.com/bluelovers/yarn-tool/commit/bfab1ea4c19846270dee8990253b30e84f8f4aee))



## [2.1.6](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@2.1.5...yarn-tool@2.1.6) (2025-09-08)

**Note:** Version bump only for package yarn-tool





## [2.1.5](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@2.1.4...yarn-tool@2.1.5) (2025-09-07)



### 📌　Dependencies

* update deps ([93faf53](https://github.com/bluelovers/yarn-tool/commit/93faf53d7d68891dc503da38b4beb603f9dafe5d))
* fix and update deps avoid use yargs@18 ([4862687](https://github.com/bluelovers/yarn-tool/commit/486268763b89bc848c9cd1e9e92df4b923778fa0))



## [2.1.4](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@2.1.3...yarn-tool@2.1.4) (2024-05-03)



### 🛠　Build System

* update typescript ([43d7695](https://github.com/bluelovers/yarn-tool/commit/43d76958c38e15a7e721b32ddb3a6e29e1ea842e))


### 📌　Dependencies

* update deps ([5a9d7a4](https://github.com/bluelovers/yarn-tool/commit/5a9d7a4b697eded06eb6575a4bd3b5fb59895c77))



## [2.1.3](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@2.1.2...yarn-tool@2.1.3) (2024-03-01)

**Note:** Version bump only for package yarn-tool





## [2.1.2](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@2.0.1...yarn-tool@2.1.2) (2024-03-01)

**Note:** Version bump only for package yarn-tool





## [2.0.1](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.18...yarn-tool@2.0.1) (2023-10-10)



### 🐛　Bug Fixes

* **style:** use `@yarn-tool/write-package-json` ([c7f4612](https://github.com/bluelovers/yarn-tool/commit/c7f461263dd80b019f2b79eb29e3cc412a01938a))


### 🔖　Miscellaneous

* . ([2e35910](https://github.com/bluelovers/yarn-tool/commit/2e3591088bdcfdb24f02d686a088d8c51ce81a37))



## [1.4.18](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.17...yarn-tool@1.4.18) (2023-01-24)

**Note:** Version bump only for package yarn-tool





## [1.4.17](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.16...yarn-tool@1.4.17) (2022-12-09)

**Note:** Version bump only for package yarn-tool





## [1.4.16](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.15...yarn-tool@1.4.16) (2022-11-05)



### ⚙️　Continuous Integration

* **idea:** add run config ([f4de7ca](https://github.com/bluelovers/yarn-tool/commit/f4de7cacc819a00203ae46204026e29105956d85))


### 🔖　Miscellaneous

* . ([0bc8aab](https://github.com/bluelovers/yarn-tool/commit/0bc8aab1f05599f3000205c587dab0a1cee08c1e))



## [1.4.15](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.14...yarn-tool@1.4.15) (2022-10-28)

**Note:** Version bump only for package yarn-tool





## [1.4.14](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.13...yarn-tool@1.4.14) (2022-10-01)

**Note:** Version bump only for package yarn-tool





## [1.4.13](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.12...yarn-tool@1.4.13) (2022-09-30)

**Note:** Version bump only for package yarn-tool





## [1.4.12](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.11...yarn-tool@1.4.12) (2022-09-29)

**Note:** Version bump only for package yarn-tool





## [1.4.11](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.10...yarn-tool@1.4.11) (2022-09-28)

**Note:** Version bump only for package yarn-tool





## [1.4.10](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.9...yarn-tool@1.4.10) (2022-09-27)

**Note:** Version bump only for package yarn-tool





## [1.4.9](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.8...yarn-tool@1.4.9) (2022-09-22)

**Note:** Version bump only for package yarn-tool





## [1.4.8](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.7...yarn-tool@1.4.8) (2022-09-12)

**Note:** Version bump only for package yarn-tool





## [1.4.7](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.6...yarn-tool@1.4.7) (2022-09-10)

**Note:** Version bump only for package yarn-tool





## [1.4.6](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.5...yarn-tool@1.4.6) (2022-09-06)

**Note:** Version bump only for package yarn-tool





## [1.4.5](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.4...yarn-tool@1.4.5) (2022-08-28)



### ✨　Features

* v8-compile-cache ([3d18ccc](https://github.com/bluelovers/yarn-tool/commit/3d18ccc057c9c05975bdff235583868692c10c1f))



## [1.4.4](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.3...yarn-tool@1.4.4) (2022-08-26)

**Note:** Version bump only for package yarn-tool





## [1.4.3](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.2...yarn-tool@1.4.3) (2022-08-26)



### 🐛　Bug Fixes

* update import ([b1c6f16](https://github.com/bluelovers/yarn-tool/commit/b1c6f1640d801f2dd7dd618d677d35f333acee3f))


### ✨　Features

* print diff msg ([bbd29aa](https://github.com/bluelovers/yarn-tool/commit/bbd29aad59d9aeb1250e5c3124458256c6b70527))


### 📦　Code Refactoring

* update import ([e9ed4a9](https://github.com/bluelovers/yarn-tool/commit/e9ed4a943b13ab678e41ab990b77d04a3f0a6456))



## [1.4.2](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.4.1...yarn-tool@1.4.2) (2022-08-26)

**Note:** Version bump only for package yarn-tool





## [1.4.1](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.3.5...yarn-tool@1.4.1) (2022-08-20)

**Note:** Version bump only for package yarn-tool





## [1.3.5](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.3.4...yarn-tool@1.3.5) (2022-08-19)

**Note:** Version bump only for package yarn-tool





## [1.3.4](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.3.3...yarn-tool@1.3.4) (2022-08-18)

**Note:** Version bump only for package yarn-tool





## [1.3.3](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.3.2...yarn-tool@1.3.3) (2022-08-15)

**Note:** Version bump only for package yarn-tool





## [1.3.2](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.3.1...yarn-tool@1.3.2) (2022-08-15)

**Note:** Version bump only for package yarn-tool





## [1.3.1](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.64...yarn-tool@1.3.1) (2022-08-13)


### 📦　Code Refactoring

* update import ([ffc1847](https://github.com/bluelovers/yarn-tool/commit/ffc184743aad82f5029d9febfe55e50d47e61ed0))


### 📌　Dependencies

* update deps ([54a80b3](https://github.com/bluelovers/yarn-tool/commit/54a80b3bf2f4ce886cf7756241291d0d97aa8ae2))


### BREAKING CHANGES

* update deps





## [1.2.64](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.63...yarn-tool@1.2.64) (2022-07-29)

**Note:** Version bump only for package yarn-tool





## [1.2.63](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.62...yarn-tool@1.2.63) (2022-07-29)


### ✨　Features

* **ncu:** 優化 ncu 指令並且支援直接處理 workspace 下所有 package ([84fc99b](https://github.com/bluelovers/yarn-tool/commit/84fc99bd926c972db595289688d17113f7489fda))


### BREAKING CHANGES

* **ncu:** 優化 ncu 指令並且支援直接處理 workspace 下所有 package





## [1.2.62](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.61...yarn-tool@1.2.62) (2022-07-14)

**Note:** Version bump only for package yarn-tool





## [1.2.61](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.60...yarn-tool@1.2.61) (2022-07-14)

**Note:** Version bump only for package yarn-tool





## [1.2.60](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.59...yarn-tool@1.2.60) (2022-07-07)


### ♻️　Dependencies

* update deps ([263242c](https://github.com/bluelovers/yarn-tool/commit/263242cef6ebd710e5e4a6409b1b981854455e93))





## [1.2.59](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.58...yarn-tool@1.2.59) (2022-06-28)


### ♻️　Dependencies

* update deps ([6f750ff](https://github.com/bluelovers/yarn-tool/commit/6f750ff11b17bb44d74aa87a0ce63e8fe1350ba3))





## [1.2.58](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.57...yarn-tool@1.2.58) (2022-05-11)

**Note:** Version bump only for package yarn-tool





## [1.2.57](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.56...yarn-tool@1.2.57) (2022-03-16)

**Note:** Version bump only for package yarn-tool





## [1.2.56](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.55...yarn-tool@1.2.56) (2022-03-14)

**Note:** Version bump only for package yarn-tool





## [1.2.55](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.54...yarn-tool@1.2.55) (2022-02-20)

**Note:** Version bump only for package yarn-tool





## [1.2.54](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.53...yarn-tool@1.2.54) (2022-02-19)

**Note:** Version bump only for package yarn-tool





## [1.2.53](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.52...yarn-tool@1.2.53) (2022-02-12)

**Note:** Version bump only for package yarn-tool





## [1.2.52](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.51...yarn-tool@1.2.52) (2022-02-05)

**Note:** Version bump only for package yarn-tool





## [1.2.51](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.50...yarn-tool@1.2.51) (2022-02-01)

**Note:** Version bump only for package yarn-tool





## [1.2.50](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.49...yarn-tool@1.2.50) (2022-02-01)

**Note:** Version bump only for package yarn-tool





## [1.2.49](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.48...yarn-tool@1.2.49) (2022-01-31)

**Note:** Version bump only for package yarn-tool





## [1.2.48](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.47...yarn-tool@1.2.48) (2022-01-28)

**Note:** Version bump only for package yarn-tool





## [1.2.47](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.46...yarn-tool@1.2.47) (2022-01-25)

**Note:** Version bump only for package yarn-tool





## [1.2.46](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.45...yarn-tool@1.2.46) (2022-01-13)

**Note:** Version bump only for package yarn-tool





## [1.2.45](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.44...yarn-tool@1.2.45) (2022-01-02)

**Note:** Version bump only for package yarn-tool





## [1.2.44](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.43...yarn-tool@1.2.44) (2022-01-01)

**Note:** Version bump only for package yarn-tool





## [1.2.43](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.42...yarn-tool@1.2.43) (2022-01-01)

**Note:** Version bump only for package yarn-tool





## [1.2.42](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.41...yarn-tool@1.2.42) (2021-12-31)

**Note:** Version bump only for package yarn-tool





## [1.2.41](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.40...yarn-tool@1.2.41) (2021-12-30)

**Note:** Version bump only for package yarn-tool





## [1.2.40](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.39...yarn-tool@1.2.40) (2021-12-29)

**Note:** Version bump only for package yarn-tool





## [1.2.39](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.38...yarn-tool@1.2.39) (2021-12-29)


### ✨　Features

* auto check/fix workspaces/package ([cc3ecb4](https://github.com/bluelovers/yarn-tool/commit/cc3ecb40454804e34a1cc19f3a6de78b907eb1f4))





## [1.2.38](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.37...yarn-tool@1.2.38) (2021-12-27)


### ✨　Features

* add `scope sync` ([76bda2a](https://github.com/bluelovers/yarn-tool/commit/76bda2a6a20226d25b1fc8c84c0e1e6e1ec4f39c))





## [1.2.37](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.36...yarn-tool@1.2.37) (2021-12-27)

**Note:** Version bump only for package yarn-tool





## [1.2.36](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.35...yarn-tool@1.2.36) (2021-12-27)

**Note:** Version bump only for package yarn-tool





## [1.2.35](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.34...yarn-tool@1.2.35) (2021-12-27)

**Note:** Version bump only for package yarn-tool





## [1.2.34](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.33...yarn-tool@1.2.34) (2021-12-26)

**Note:** Version bump only for package yarn-tool





## [1.2.33](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.32...yarn-tool@1.2.33) (2021-12-26)

**Note:** Version bump only for package yarn-tool





## [1.2.32](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.31...yarn-tool@1.2.32) (2021-12-26)

**Note:** Version bump only for package yarn-tool





## [1.2.31](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.30...yarn-tool@1.2.31) (2021-12-26)

**Note:** Version bump only for package yarn-tool





## [1.2.30](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.29...yarn-tool@1.2.30) (2021-12-19)

**Note:** Version bump only for package yarn-tool





## [1.2.29](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.28...yarn-tool@1.2.29) (2021-12-17)

**Note:** Version bump only for package yarn-tool





## [1.2.28](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.27...yarn-tool@1.2.28) (2021-12-16)

**Note:** Version bump only for package yarn-tool





## [1.2.27](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.26...yarn-tool@1.2.27) (2021-12-08)

**Note:** Version bump only for package yarn-tool





## [1.2.26](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.25...yarn-tool@1.2.26) (2021-12-08)


### 🐛　Bug Fixes

* scope add/remove ([509e4ee](https://github.com/bluelovers/yarn-tool/commit/509e4eeb73d813d7d5e843ed7c6fe5bb3c9d9874))





## [1.2.25](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.24...yarn-tool@1.2.25) (2021-12-08)


### ✨　Features

* add `@` ([9f99e38](https://github.com/bluelovers/yarn-tool/commit/9f99e38c17cb1223bb10a64e5e49066d82a4b31c))





## [1.2.24](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.23...yarn-tool@1.2.24) (2021-12-07)

**Note:** Version bump only for package yarn-tool





## [1.2.23](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.22...yarn-tool@1.2.23) (2021-12-07)

**Note:** Version bump only for package yarn-tool





## [1.2.22](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.21...yarn-tool@1.2.22) (2021-12-06)

**Note:** Version bump only for package yarn-tool





## [1.2.21](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.20...yarn-tool@1.2.21) (2021-12-06)

**Note:** Version bump only for package yarn-tool





## [1.2.20](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.19...yarn-tool@1.2.20) (2021-12-06)


### ✨　Features

* support update scope setting ([83aaa7b](https://github.com/bluelovers/yarn-tool/commit/83aaa7be9ba0c6a9b48ce9208558bed327271fe4))





## [1.2.19](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.18...yarn-tool@1.2.19) (2021-11-30)

**Note:** Version bump only for package yarn-tool





## [1.2.18](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.17...yarn-tool@1.2.18) (2021-11-28)


### ♻️　Chores

* **deps:** update deps ([631ca15](https://github.com/bluelovers/yarn-tool/commit/631ca15d83186abda9b2806f684dad6affcc3a64))





## [1.2.17](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.16...yarn-tool@1.2.17) (2021-11-23)

**Note:** Version bump only for package yarn-tool





## [1.2.16](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.15...yarn-tool@1.2.16) (2021-11-08)

**Note:** Version bump only for package yarn-tool





## [1.2.15](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.14...yarn-tool@1.2.15) (2021-10-27)


### ♻️　Chores

* **deps:** update deps ([0597711](https://github.com/bluelovers/yarn-tool/commit/05977119377ee8c40d14f2e9c6c8c05b1cc5422a))





## [1.2.14](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.13...yarn-tool@1.2.14) (2021-10-13)

**Note:** Version bump only for package yarn-tool





## [1.2.13](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.12...yarn-tool@1.2.13) (2021-09-21)


### 🐛　Bug Fixes

* avoid wmic failed windows 10 ([cd76b51](https://github.com/bluelovers/yarn-tool/commit/cd76b51f3928f4131ee7bc0c205363344c8be8f4))


### 🔖　Miscellaneous

* . ([baa8a08](https://github.com/bluelovers/yarn-tool/commit/baa8a08b9ea8f56df1e1f9a1a89505eef97a16b6))





## [1.2.12](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.11...yarn-tool@1.2.12) (2021-09-15)

**Note:** Version bump only for package yarn-tool





## [1.2.11](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.10...yarn-tool@1.2.11) (2021-08-20)

**Note:** Version bump only for package yarn-tool





## [1.2.10](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.8...yarn-tool@1.2.10) (2021-08-20)


### 🐛　Bug Fixes

* ws sort ([0ff4749](https://github.com/bluelovers/yarn-tool/commit/0ff4749bc7a36b70888aeac8e3a690dd85a3ea97))





## [1.2.8](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.7...yarn-tool@1.2.8) (2021-08-14)


### ✨　Features

* **bin:** global `-W` ([3042359](https://github.com/bluelovers/yarn-tool/commit/3042359bb95398e886482aac572ae6f6fd55d8a6))
* **root:** lazy support other cmd ([1c8cc27](https://github.com/bluelovers/yarn-tool/commit/1c8cc272217ec8d56bccc48e9cd17966971fb463))
* **ws:** add `ws sort` - sort each package.json file in workspaces ([50529ad](https://github.com/bluelovers/yarn-tool/commit/50529adfa84931570d1371af520a042e6373c25b))


### ♻️　Chores

* **deps:** update deps ([0480ff1](https://github.com/bluelovers/yarn-tool/commit/0480ff1c831daabed3cd9cdccff96f8c729dd529))





## [1.2.7](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.6...yarn-tool@1.2.7) (2021-07-24)

**Note:** Version bump only for package yarn-tool





## [1.2.6](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.5...yarn-tool@1.2.6) (2021-07-24)


### 🐛　Bug Fixes

* 修正當 不存在 workspaces 時，初始化 會判定錯誤的問題 ([9549ce8](https://github.com/bluelovers/yarn-tool/commit/9549ce8291d7e0832c78a4f25432e6a58ec96bf3))





## [1.2.5](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.4...yarn-tool@1.2.5) (2021-07-24)

**Note:** Version bump only for package yarn-tool





## [1.2.4](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.3...yarn-tool@1.2.4) (2021-07-23)


### 📦　Code Refactoring

* 將 `yt ws add` 的執行方式 改為 `lerna add` 而非 `yarn add -W` ([b9d4210](https://github.com/bluelovers/yarn-tool/commit/b9d421033bb989f5d49dcaaf75a4bb119bce239b))


### ♻️　Chores

* update deps ([2726da2](https://github.com/bluelovers/yarn-tool/commit/2726da250517f85aff841a222be0f5192a382b1b))


### BREAKING CHANGE

* 將 `yt ws add` 的執行方式 改為 `lerna add` 而非 `yarn add -W`





## [1.2.3](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.2...yarn-tool@1.2.3) (2021-07-16)

**Note:** Version bump only for package yarn-tool





## [1.2.2](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.2.1...yarn-tool@1.2.2) (2021-07-13)

**Note:** Version bump only for package yarn-tool





## [1.2.1](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.1.8...yarn-tool@1.2.1) (2021-07-11)


### 🐛　Bug Fixes

* data maybe undefined ([030ba3c](https://github.com/bluelovers/yarn-tool/commit/030ba3cd184977fe967fc8abd2464e983c9b78f5))


### 🛠　Build System

* update deps and use tslib ([cd7128c](https://github.com/bluelovers/yarn-tool/commit/cd7128c775e032604be890edad7a6d37f8889905))





## [1.1.8](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.1.7...yarn-tool@1.1.8) (2021-06-22)


### 🐛　Bug Fixes

* only print message when updated ([378fea9](https://github.com/bluelovers/yarn-tool/commit/378fea9601381b395c06be02c88413e2a49d9f76))





## [1.1.7](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.1.6...yarn-tool@1.1.7) (2021-06-21)


### 🐛　Bug Fixes

* 沒有執行 add 時忽略多餘的 dedupe 步驟 ([1606f87](https://github.com/bluelovers/yarn-tool/commit/1606f8745796399331259fcf76ec852c6cb95c6b))


### ✨　Features

* show exists ([770b919](https://github.com/bluelovers/yarn-tool/commit/770b9196047ba6ad9353985d66cf74c29cbb4607))
* support wrapDedupeAsync ([7fa9f5d](https://github.com/bluelovers/yarn-tool/commit/7fa9f5d840cdd7b089a0fae5e2fb205903abdb31))





## [1.1.6](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.150...yarn-tool@1.1.6) (2021-06-07)


### ♻️　Chores

* **release:** publish ([7887236](https://github.com/bluelovers/yarn-tool/commit/7887236766d2a652190538d4a9dcf9208fe51117))
* **release:** publish ([0299ec9](https://github.com/bluelovers/yarn-tool/commit/0299ec965628075912a82a32ae7e49de37dc9c4f))
* **release:** publish ([cb5a2e0](https://github.com/bluelovers/yarn-tool/commit/cb5a2e0935c1b17c4a762a46fa0e8c5292cb0fd9))
* **release:** publish ([3c9db56](https://github.com/bluelovers/yarn-tool/commit/3c9db5636ff71558ffc8ad0deb546537cb5af7ca))
* **release:** publish ([91e3705](https://github.com/bluelovers/yarn-tool/commit/91e3705bb612332b4cff1b7d2b1366e72679694b))
* update deps ([df19af1](https://github.com/bluelovers/yarn-tool/commit/df19af187dc9a160328d3850aff591cd5acb874e))





## [1.0.150](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.146...yarn-tool@1.0.150) (2021-02-08)


### ✨　Features

* **install:** add `--reset-lockfile` for ignore and reset yarn.lock lockfile ([5328722](https://github.com/bluelovers/yarn-tool/commit/5328722ff1d7e6581d4d41304a0c5f685ad42342))


### ♻️　Chores

* **deps:** update deps ([5cc8347](https://github.com/bluelovers/yarn-tool/commit/5cc83474632d5c00abc42083663bdd177a35c2c3))
* **release:** publish ([f6cd44b](https://github.com/bluelovers/yarn-tool/commit/f6cd44b12a3363f11868045b2d9b62e104e7db23))
* **release:** publish ([b139f18](https://github.com/bluelovers/yarn-tool/commit/b139f18a7a9bfba3211bce51f674eaf9118da259))
* **release:** publish ([e518c84](https://github.com/bluelovers/yarn-tool/commit/e518c8483351812830ef1cb57fb9b1c322f0e4f3))
* update deps ([2cd40cc](https://github.com/bluelovers/yarn-tool/commit/2cd40cc165d536738c6babf227a6db7dea1ea5de))


### 🔖　Miscellaneous

* . ([3aecaa2](https://github.com/bluelovers/yarn-tool/commit/3aecaa23c333b2bf62dc093f3d678aa829e9998e))





## [1.0.146](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.145...yarn-tool@1.0.146) (2020-09-23)

**Note:** Version bump only for package yarn-tool





## [1.0.145](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.144...yarn-tool@1.0.145) (2020-09-04)

**Note:** Version bump only for package yarn-tool





## [1.0.144](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.143...yarn-tool@1.0.144) (2020-09-04)

**Note:** Version bump only for package yarn-tool





## [1.0.143](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.142...yarn-tool@1.0.143) (2020-09-04)


### 🐛　Bug Fixes

* print table ([bf1d8d6](https://github.com/bluelovers/yarn-tool/commit/bf1d8d6b17e49c7b3e8e942b6c0709504015e46b))





## [1.0.142](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.141...yarn-tool@1.0.142) (2020-09-04)


### 🐛　Bug Fixes

* 修正直接從 工作區內新增 deps 後 導致安裝列表為空 而導致出錯 ([0de2ee2](https://github.com/bluelovers/yarn-tool/commit/0de2ee202ea155ee3346e8c53c434e3071be8036))





## [1.0.141](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.140...yarn-tool@1.0.141) (2020-08-19)


### ✨　Features

* support direct add deps from workspaces ([ff4bcfe](https://github.com/bluelovers/yarn-tool/commit/ff4bcfed70af14c90b9a24cfbf63f6206ddc29d9))





## [1.0.140](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.139...yarn-tool@1.0.140) (2020-08-17)


### ✨　Features

* assertExecInstall(cp); ([b81a34e](https://github.com/bluelovers/yarn-tool/commit/b81a34e65e0d087bccfd99987b53ac5fe79fd21b))
* 優化 install types ([24c682c](https://github.com/bluelovers/yarn-tool/commit/24c682cd4e46994ee7dc8a48dfb64a69c617f424))


### 📦　Code Refactoring

* use `@yarn-tool/pkg-deps-util` ([9241d95](https://github.com/bluelovers/yarn-tool/commit/9241d95728d1720978c453a612b332034a009ce6))





## [1.0.139](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.138...yarn-tool@1.0.139) (2020-08-13)

**Note:** Version bump only for package yarn-tool





## [1.0.138](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.137...yarn-tool@1.0.138) (2020-08-12)


### 🐛　Bug Fixes

* 修正 yarn.lock 沒有正確轉換的問題 ([92ba4e3](https://github.com/bluelovers/yarn-tool/commit/92ba4e38447a1570381eb8efac67fbed70457af9))





## [1.0.137](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.136...yarn-tool@1.0.137) (2020-08-12)


### ✨　Features

* support update tag version in yarn.lock ([4279eed](https://github.com/bluelovers/yarn-tool/commit/4279eeda629797ba9603d40534cd6715d3c3b7d3))





## [1.0.136](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.135...yarn-tool@1.0.136) (2020-08-11)

**Note:** Version bump only for package yarn-tool





## [1.0.135](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.134...yarn-tool@1.0.135) (2020-08-10)

**Note:** Version bump only for package yarn-tool





## [1.0.134](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.132...yarn-tool@1.0.134) (2020-08-08)

**Note:** Version bump only for package yarn-tool





## [1.0.132](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.131...yarn-tool@1.0.132) (2020-08-06)

**Note:** Version bump only for package yarn-tool





## [1.0.131](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.130...yarn-tool@1.0.131) (2020-08-06)

**Note:** Version bump only for package yarn-tool





## [1.0.130](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.129...yarn-tool@1.0.130) (2020-08-06)


### ✨　Features

* bump version support interactive mode ([19c9f03](https://github.com/bluelovers/yarn-tool/commit/19c9f031aab2b08db26fba0c609d49ab8f50dd81))





## [1.0.129](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.128...yarn-tool@1.0.129) (2020-08-02)


### ✨　Features

* bump version of package ([f9945a9](https://github.com/bluelovers/yarn-tool/commit/f9945a96ae82d4b2029c4635ebc3a2c4ed506aa1))





## [1.0.128](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.126...yarn-tool@1.0.128) (2020-08-01)

**Note:** Version bump only for package yarn-tool





## [1.0.126](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.125...yarn-tool@1.0.126) (2020-08-01)

**Note:** Version bump only for package yarn-tool





## [1.0.125](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.124...yarn-tool@1.0.125) (2020-07-31)

**Note:** Version bump only for package yarn-tool





## [1.0.124](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.123...yarn-tool@1.0.124) (2020-07-30)

**Note:** Version bump only for package yarn-tool





## [1.0.123](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.122...yarn-tool@1.0.123) (2020-07-28)

**Note:** Version bump only for package yarn-tool





## [1.0.122](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.121...yarn-tool@1.0.122) (2020-07-27)

**Note:** Version bump only for package yarn-tool





## [1.0.121](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.120...yarn-tool@1.0.121) (2020-07-26)

**Note:** Version bump only for package yarn-tool





## [1.0.120](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.119...yarn-tool@1.0.120) (2020-07-24)

**Note:** Version bump only for package yarn-tool





## [1.0.119](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.118...yarn-tool@1.0.119) (2020-07-19)

**Note:** Version bump only for package yarn-tool





## [1.0.118](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.117...yarn-tool@1.0.118) (2020-07-19)

**Note:** Version bump only for package yarn-tool





## [1.0.117](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.116...yarn-tool@1.0.117) (2020-07-19)

**Note:** Version bump only for package yarn-tool





## [1.0.116](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.115...yarn-tool@1.0.116) (2020-07-19)

**Note:** Version bump only for package yarn-tool





## [1.0.115](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.114...yarn-tool@1.0.115) (2020-07-18)

**Note:** Version bump only for package yarn-tool





## [1.0.114](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.113...yarn-tool@1.0.114) (2020-07-12)

**Note:** Version bump only for package yarn-tool





## [1.0.113](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.112...yarn-tool@1.0.113) (2020-07-12)

**Note:** Version bump only for package yarn-tool





## [1.0.112](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.111...yarn-tool@1.0.112) (2020-07-05)

**Note:** Version bump only for package yarn-tool





## [1.0.111](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.110...yarn-tool@1.0.111) (2020-07-04)

**Note:** Version bump only for package yarn-tool





## [1.0.110](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.109...yarn-tool@1.0.110) (2020-07-03)

**Note:** Version bump only for package yarn-tool





## [1.0.109](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.108...yarn-tool@1.0.109) (2020-06-27)

**Note:** Version bump only for package yarn-tool





## [1.0.108](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.107...yarn-tool@1.0.108) (2020-06-26)

**Note:** Version bump only for package yarn-tool





## [1.0.107](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.106...yarn-tool@1.0.107) (2020-06-23)


### ✨　Features

* support empty yarn.lock ([32a793b](https://github.com/bluelovers/yarn-tool/commit/32a793b9ddc698ae882021b9e1e32f3bd7bb38e1))


### 🛠　Build System

* update .js ([6b2052a](https://github.com/bluelovers/yarn-tool/commit/6b2052ad5ee68db51996d9746c1edf9c5c773dfc))





## [1.0.106](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.105...yarn-tool@1.0.106) (2020-06-23)

**Note:** Version bump only for package yarn-tool





## [1.0.105](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.104...yarn-tool@1.0.105) (2020-06-23)

**Note:** Version bump only for package yarn-tool





## [1.0.104](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.103...yarn-tool@1.0.104) (2020-06-20)

**Note:** Version bump only for package yarn-tool





## [1.0.103](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.101...yarn-tool@1.0.103) (2020-06-19)

**Note:** Version bump only for package yarn-tool





## [1.0.101](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.100...yarn-tool@1.0.101) (2020-06-17)

**Note:** Version bump only for package yarn-tool





## [1.0.100](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.99...yarn-tool@1.0.100) (2020-06-16)

**Note:** Version bump only for package yarn-tool





## [1.0.99](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.98...yarn-tool@1.0.99) (2020-06-16)

**Note:** Version bump only for package yarn-tool





## [1.0.98](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.97...yarn-tool@1.0.98) (2020-06-16)

**Note:** Version bump only for package yarn-tool





## [1.0.97](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.96...yarn-tool@1.0.97) (2020-06-16)


### ♻️　Chores

*  update deps ([6c9febc](https://github.com/bluelovers/yarn-tool/commit/6c9febc6da40f76832879d672a6331b57d77b975))





## [1.0.96](https://github.com/bluelovers/yarn-tool/compare/yarn-tool@1.0.95...yarn-tool@1.0.96) (2020-06-15)

**Note:** Version bump only for package yarn-tool





## 1.0.95 (2020-06-15)


### ♻️　Chores

* **release:**  publish ([5c23baf](https://github.com/bluelovers/yarn-tool/commit/5c23baf13ca5bdaa81f66b345b45a50d10351fbf))
* **release:**  publish ([729db68](https://github.com/bluelovers/yarn-tool/commit/729db680d1f206640a33b70a6d8c17183ef8ed21))
*  update deps ([620f85d](https://github.com/bluelovers/yarn-tool/commit/620f85d0dc36dbc7423894ee21163f61fb09205d))
* **release:**  publish ([ba6c324](https://github.com/bluelovers/yarn-tool/commit/ba6c324f7a352f596d41723f94ac772bf965b7cd))
* **release:**  publish ([3af946e](https://github.com/bluelovers/yarn-tool/commit/3af946e7f168c9e712d685c4f50bd76dad36f5f3))
* **release:**  publish ([5ae570f](https://github.com/bluelovers/yarn-tool/commit/5ae570fbae22e7209cace906d7bb563433fe2d56))
* **release:**  publish ([6d90386](https://github.com/bluelovers/yarn-tool/commit/6d903868e4290b8cbdfa7305b52ff73294278740))
* **release:**  publish ([18f0853](https://github.com/bluelovers/yarn-tool/commit/18f08538a26c83bcdeeadc88416bcf01552ecb69))
* **release:**  publish ([13ce122](https://github.com/bluelovers/yarn-tool/commit/13ce122f888938586645c6ed67f02ae9fffaf52a))
*  update deps ([cded6e4](https://github.com/bluelovers/yarn-tool/commit/cded6e4dfa415c53e708424d1747707951ad097e))
* **release:**  publish ([be7e977](https://github.com/bluelovers/yarn-tool/commit/be7e97748fea9f429794431eee7c488604c6db5b))
* **release:**  publish ([62663d6](https://github.com/bluelovers/yarn-tool/commit/62663d652ac721f20ef7a60624ae64ea8a78e48f))
* **release:**  publish ([5b6e245](https://github.com/bluelovers/yarn-tool/commit/5b6e245f6ae2f509267312ee074c12bac1cfff03))
* **release:**  publish ([4fa3bb0](https://github.com/bluelovers/yarn-tool/commit/4fa3bb097a66a11aaa5bd3af49ec167087ba738a))
* **release:**  publish ([f7f552f](https://github.com/bluelovers/yarn-tool/commit/f7f552fc70dc15949f5318275ab4f458a7721308))
* **release:**  publish ([64f19d1](https://github.com/bluelovers/yarn-tool/commit/64f19d1ba808418534a3e1b8ad7774214a7c7146))
* **release:**  publish ([9f6c913](https://github.com/bluelovers/yarn-tool/commit/9f6c91316f4b7ec88fd3e3bcdfc5ceebee66cf37))
* **release:**  publish ([8123f85](https://github.com/bluelovers/yarn-tool/commit/8123f85765c9060b3b20731a5c56341672d59360))
* **release:**  publish ([5d90404](https://github.com/bluelovers/yarn-tool/commit/5d90404a76980d39883bbfd37c3a041b39fde583))
* **release:**  publish ([028eaba](https://github.com/bluelovers/yarn-tool/commit/028eaba7a2c453b6d9b557f2d7f250f6aa75bdd5))
* **release:**  publish ([7e9540e](https://github.com/bluelovers/yarn-tool/commit/7e9540ee91ebb8f083f70aede9b13e6120198392))
* **release:**  publish ([70c51d6](https://github.com/bluelovers/yarn-tool/commit/70c51d60cc933757a4397df64c24099afcf16b74))
* **release:**  publish ([73f506c](https://github.com/bluelovers/yarn-tool/commit/73f506c690a6019ba5324739d988334af53fad55))
* **release:**  publish ([c570e58](https://github.com/bluelovers/yarn-tool/commit/c570e58824b5a4b5ed08f0bf26a33894e17eabdb))
* **release:**  publish ([fd80fe2](https://github.com/bluelovers/yarn-tool/commit/fd80fe2edb675fc297d7d79942c1b885f8a002c8))
* **release:**  publish ([cf698c9](https://github.com/bluelovers/yarn-tool/commit/cf698c98b7357176846283dbf60dffcd4fd340b6))
* **release:**  publish ([1ab89ee](https://github.com/bluelovers/yarn-tool/commit/1ab89ee8b4b88b9d741901c389f2634aef302ad9))
* **release:**  publish ([c9d281e](https://github.com/bluelovers/yarn-tool/commit/c9d281ed3450c534b59e1ed41c22143fd262d602))
* **release:**  publish ([b00cc2e](https://github.com/bluelovers/yarn-tool/commit/b00cc2e1800ea40076f9b5deab57f602347602a3))
* **release:**  publish ([1d75db3](https://github.com/bluelovers/yarn-tool/commit/1d75db3c451dfbd7283df96dc3f6dde0a32c3876))
* **release:**  publish ([944116c](https://github.com/bluelovers/yarn-tool/commit/944116cebad150bceb6d283a1d7c9ccd37039298))
* **release:**  publish ([1551f9b](https://github.com/bluelovers/yarn-tool/commit/1551f9bfdc3a2f6b6900823fbf235e00b413e49e))
* **release:**  publish ([119e1f7](https://github.com/bluelovers/yarn-tool/commit/119e1f75171e320fc174226e016197c0e724724d))
* **release:**  publish ([ad5ee62](https://github.com/bluelovers/yarn-tool/commit/ad5ee628392cb8eb080098db357f74b999b53900))
* **release:**  publish ([c8e8797](https://github.com/bluelovers/yarn-tool/commit/c8e87974e70a824d69fffb29f2333167fecb605a))
* **release:**  publish ([01c8fca](https://github.com/bluelovers/yarn-tool/commit/01c8fcaab07a932128cb60b541259a4be7564bc9))
* **release:**  publish ([621b3eb](https://github.com/bluelovers/yarn-tool/commit/621b3ebf7869d92ebed96d507b82e99ad6bd72a8))
* **release:**  publish ([a0c4db2](https://github.com/bluelovers/yarn-tool/commit/a0c4db2f3b7fdf42bbc9b7cc5ae7ea84fee0d255))
* **release:**  publish ([11d85de](https://github.com/bluelovers/yarn-tool/commit/11d85de77920d090ab5921611c5331e802e907c3))
* **release:**  publish ([c1bfb78](https://github.com/bluelovers/yarn-tool/commit/c1bfb7866aa49222016bb350891146ce191346da))
* **release:**  publish ([faab2fd](https://github.com/bluelovers/yarn-tool/commit/faab2fdeff8a78780e7a4ff4731591134ac79b46))


### 🐛　Bug Fixes

*  Error: Cannot find module 'debug-color2' ([690d8a3](https://github.com/bluelovers/yarn-tool/commit/690d8a3b0462031f0060ea9bbbdb2b105216c059))
*  ...process.env, ([ce46493](https://github.com/bluelovers/yarn-tool/commit/ce46493149609e4d674573ab3e32aa4f76014fde))
*  bug of list with new yargs ([7f1629b](https://github.com/bluelovers/yarn-tool/commit/7f1629b4710814b52442ae3a856e65660e54cb6a))
*  防止 yarn.lock 不存在 導致 ncu 失敗 ([65da26a](https://github.com/bluelovers/yarn-tool/commit/65da26a90c0fa597b347491b7bae27fbf1432cdb))
*  修正路徑載入問題 ([0d91802](https://github.com/bluelovers/yarn-tool/commit/0d91802a2e5128db064b3c6cff119c0abeac8fe6))
*  修正執行 ncu 時 resolutions 不存在導致的錯誤 ([a9916ad](https://github.com/bluelovers/yarn-tool/commit/a9916ad3f633fdc3a692b54686a81ac1eed7e655))


### ✨　Features

*  try set NO_UPDATE_NOTIFIER=1 ([c06151f](https://github.com/bluelovers/yarn-tool/commit/c06151f6f03b0d5af64d437d725406913175f675))
*  use @yarn-tool/ncu ([d9a294c](https://github.com/bluelovers/yarn-tool/commit/d9a294c5e743264262ef814ba91cdab5cd024ee8))
*  use @yarn-tool/yarnlock ([a400d8f](https://github.com/bluelovers/yarn-tool/commit/a400d8f0a61dbefdc72dedc5d556abecadb40585))
*  run/exec in workspaces root ([e6e9f8a](https://github.com/bluelovers/yarn-tool/commit/e6e9f8aa3fbc5817f3f2bff2762767bbe4c33179))
*  use sort-package-json3 ([129bd66](https://github.com/bluelovers/yarn-tool/commit/129bd6695260a4f35192cfef84ccd330c481ae89))
*  support create npm-shrinkwrap ([4301358](https://github.com/bluelovers/yarn-tool/commit/43013583ee0bf0ffb10530cab5bb7d10d2fe13ba))


### Miscellaneous

* . ([67d84ed](https://github.com/bluelovers/yarn-tool/commit/67d84edf84c6f0bfcf45bd14e71ecc824e0c8e82))
* . ([4a6f039](https://github.com/bluelovers/yarn-tool/commit/4a6f03945663e22f173ad2e4bf14c7da0316fc96))
* . ([b766e55](https://github.com/bluelovers/yarn-tool/commit/b766e5521224182d3bf0dd6bf87c2d6aa981be42))
* @bluelovers/tsconfig/esm/mapfile.json ([753af0b](https://github.com/bluelovers/yarn-tool/commit/753af0b25fc370953f2d393b9256979bbd37a8a5))
* postpublish ([e6ad032](https://github.com/bluelovers/yarn-tool/commit/e6ad0329d3fa49c8989b3fa4890656b63c1f3163))
* postpublish ([9bff10b](https://github.com/bluelovers/yarn-tool/commit/9bff10bfff97c67fcb212936a37fe8b96e494039))
* postpublish ([d86d02f](https://github.com/bluelovers/yarn-tool/commit/d86d02fd4e6f09162fb17c1d6b92c90ea3653035))
* postpublish ([61d95c1](https://github.com/bluelovers/yarn-tool/commit/61d95c1a194c3af4c228deccfcd450793b3beada))
* postpublish ([bd2bd16](https://github.com/bluelovers/yarn-tool/commit/bd2bd16f7c0ef9a6773057a7240e73b9052d0798))
* . ([b8d85d5](https://github.com/bluelovers/yarn-tool/commit/b8d85d5d2e7c439b88bc32e62b8b1ce727a5b05a))
* postpublish ([35b183f](https://github.com/bluelovers/yarn-tool/commit/35b183f62c6d43ab6446b9b6ef1c1433332bc208))
* . ([02ffaad](https://github.com/bluelovers/yarn-tool/commit/02ffaad7935b02bf9dfc0b33c9d1efba97fff966))
* postpublish ([c36bf59](https://github.com/bluelovers/yarn-tool/commit/c36bf591f4e54dc04a46c875ab8eeab3005a5af9))
* postpublish ([697c64a](https://github.com/bluelovers/yarn-tool/commit/697c64ada24249a7c9515a957d878d223fa9df35))
* postpublish ([8db7307](https://github.com/bluelovers/yarn-tool/commit/8db7307487f456eda9bc1527b47651fc1ad8af4b))
* postpublish ([822eb45](https://github.com/bluelovers/yarn-tool/commit/822eb45c7e866c09d6a5f543a65ab2f63d456744))
* postpublish ([94a761b](https://github.com/bluelovers/yarn-tool/commit/94a761b65c4517bda90d0a182d9b3894ec96f10c))
* postpublish ([3dfa05f](https://github.com/bluelovers/yarn-tool/commit/3dfa05fde90b0cd26110b491c2452690051b72b2))
* postpublish ([2f73ed4](https://github.com/bluelovers/yarn-tool/commit/2f73ed4dd0116d354c7c6fad6eef1efabd3dfe2e))
* postpublish ([fa4b8ee](https://github.com/bluelovers/yarn-tool/commit/fa4b8ee432bd15201ae578169130371738d0f211))
* postpublish ([3e97a08](https://github.com/bluelovers/yarn-tool/commit/3e97a086a59377a1225331188b4afaf746864020))
* postpublish ([e9ae716](https://github.com/bluelovers/yarn-tool/commit/e9ae716692b0882929c9d8fd89da859164c62235))
* postpublish ([8c965e9](https://github.com/bluelovers/yarn-tool/commit/8c965e98e65c408a004ea10febd7cd4565450b6a))
* postpublish ([63daec1](https://github.com/bluelovers/yarn-tool/commit/63daec11a8b2b73c571670e0cb973526017e3eeb))
* postpublish ([7d614b1](https://github.com/bluelovers/yarn-tool/commit/7d614b1b570804c34649386ab0c5244cb0666285))
* postpublish ([5747783](https://github.com/bluelovers/yarn-tool/commit/5747783c9bb29ea400d9f80ca1419a67eacb82e2))
* postpublish ([1cf1629](https://github.com/bluelovers/yarn-tool/commit/1cf1629f251cd0d5c0582e9c3e3b23768fc5a4b0))
* postpublish ([ed27d16](https://github.com/bluelovers/yarn-tool/commit/ed27d16c279ecfc42eba3d85ac88e8832eff656c))
* postpublish ([d7f2d7d](https://github.com/bluelovers/yarn-tool/commit/d7f2d7dbd780b3ae6676ba695c0f8229225661dc))
* postpublish ([e58fc7d](https://github.com/bluelovers/yarn-tool/commit/e58fc7dc9e8af1d48363e156e4d6634bae35d464))
* postpublish ([08acfa4](https://github.com/bluelovers/yarn-tool/commit/08acfa4ec590c778c9101c6981c3842ab0a4eb4a))
* postpublish ([0df90f3](https://github.com/bluelovers/yarn-tool/commit/0df90f30201d4a887b41f47c23e93fc3eef7fd9d))
* postpublish ([693f6c0](https://github.com/bluelovers/yarn-tool/commit/693f6c0ef9dd6897f9934d050585c4fd0b2f5815))
* postpublish ([cbdc855](https://github.com/bluelovers/yarn-tool/commit/cbdc8554e5ceca11dffedbd1d0a308f65603e4bc))
* postpublish ([8eb6a05](https://github.com/bluelovers/yarn-tool/commit/8eb6a0514bb4c4bdceffbf7cb27e5427a27904c2))
* . ([102110d](https://github.com/bluelovers/yarn-tool/commit/102110d82781d6767ba65bec4d306bbc474ea50d))
* postpublish ([e3ff0de](https://github.com/bluelovers/yarn-tool/commit/e3ff0de3d23c4ee23fdaa54107b3585da55779c0))
* postpublish ([f955d95](https://github.com/bluelovers/yarn-tool/commit/f955d95a82f04fbbf14c91380e024d8387ddea22))
* postpublish ([1d3a73b](https://github.com/bluelovers/yarn-tool/commit/1d3a73bed2256eaab3bef0b2c619e9c386a1aa53))
* postpublish ([86c413d](https://github.com/bluelovers/yarn-tool/commit/86c413d2c3f3023f91dc7f55b3e4839a55589d55))
* .0.18 ([d9edd7a](https://github.com/bluelovers/yarn-tool/commit/d9edd7aa4f12bbb8f18cf201d7e6e4e77100527d))
* . ([61fd59a](https://github.com/bluelovers/yarn-tool/commit/61fd59a1485fae85cc6f97f0570a5fcfea2cac31))
* . ([6f0c446](https://github.com/bluelovers/yarn-tool/commit/6f0c44607aa0daa6b5fc182f8f44e4558e5748d8))
* . ([bdc39d1](https://github.com/bluelovers/yarn-tool/commit/bdc39d1e3f7c55f34f04ddae36cc12b00f804e22))
* support when resolutions version is '*' ([5cf77f1](https://github.com/bluelovers/yarn-tool/commit/5cf77f12ac45e0cfeeaa48627573fea260512384))
* . ([9b55f2f](https://github.com/bluelovers/yarn-tool/commit/9b55f2f438adafff4160bb7853ddd7d4b5482859))
* . ([fdd744b](https://github.com/bluelovers/yarn-tool/commit/fdd744b414b6af5da844af5432d16d211d255768))
* . ([5de0f80](https://github.com/bluelovers/yarn-tool/commit/5de0f80cf859051c4b7e70168b4b07a92f4cc9b5))
* upath2 ([47990be](https://github.com/bluelovers/yarn-tool/commit/47990be1254c1ca35f7f03e906a2b55d7777cb96))
* . ([f72d34d](https://github.com/bluelovers/yarn-tool/commit/f72d34d7d2d7633b40265028b85fff827cbb2358))
* update diff style ([05ce1b3](https://github.com/bluelovers/yarn-tool/commit/05ce1b318f6ea1dd883af90ffa536d5cc733b95e))
* bug: Fixing a bug. ([15face5](https://github.com/bluelovers/yarn-tool/commit/15face5eb8ab5349c38f2c20495e12272094719d))
* yargs.commandDir ([ef7d530](https://github.com/bluelovers/yarn-tool/commit/ef7d530f6adc1feb194ab407f4eed0f1debc192e))
* yt sort , yt ws run ([08e0334](https://github.com/bluelovers/yarn-tool/commit/08e033441a427b78de23b9168cd4d1123f1c054d))
* yt init , yt ws init ([f8b09f5](https://github.com/bluelovers/yarn-tool/commit/f8b09f59cc1de5298bce0b39c92b8aa8453cb162))
* . ([4ceaf8e](https://github.com/bluelovers/yarn-tool/commit/4ceaf8efb694611dd0dc654d1e0721e9bf9cc7e2))
* . ([468c5f1](https://github.com/bluelovers/yarn-tool/commit/468c5f1ea41bc1d45b0716eb7ec8cdfda43a511a))
* yarn-tool@1.0.8 ([f5a8935](https://github.com/bluelovers/yarn-tool/commit/f5a89352ce24a016cc12a6b7c9577c71c2c13743))
* update pkg ([f1890e7](https://github.com/bluelovers/yarn-tool/commit/f1890e76acde39a9582aaf15be4fb40f0a680677))
* 簡化以後 增加命令時的步驟 ([086e0fc](https://github.com/bluelovers/yarn-tool/commit/086e0fccfe1fc30e58807441fc739565feab6270))
* better message if can't found root ([1fe728c](https://github.com/bluelovers/yarn-tool/commit/1fe728c47c527208c6cddb7a3512e9484a187e88))
* . ([9aa93bb](https://github.com/bluelovers/yarn-tool/commit/9aa93bb4a65e573a3bfdd682a9c86814fb77fb53))
* !/usr/bin/env node ([9adfde8](https://github.com/bluelovers/yarn-tool/commit/9adfde859e92503218daec6469d5caaad70ff4a5))
* . ([894b2e7](https://github.com/bluelovers/yarn-tool/commit/894b2e707f54ae089e5fe3396b9862cf35a40f19))
* . ([615c48c](https://github.com/bluelovers/yarn-tool/commit/615c48cb5e09b2af64296da350a50f036f4d0b64))
* tada: npm publish for ensure this name can be use ([ff3775e](https://github.com/bluelovers/yarn-tool/commit/ff3775e44eb6a408b15a1b79af3976030099ea7f))
* . ([695f366](https://github.com/bluelovers/yarn-tool/commit/695f36644ecd913c82c6e15673c142f857e657cf))





## 1.0.94 (2020-06-15)


### ♻️　Chores

* **release:**  publish ([729db68](https://github.com/bluelovers/yarn-tool/commit/729db680d1f206640a33b70a6d8c17183ef8ed21))
*  update deps ([620f85d](https://github.com/bluelovers/yarn-tool/commit/620f85d0dc36dbc7423894ee21163f61fb09205d))
* **release:**  publish ([ba6c324](https://github.com/bluelovers/yarn-tool/commit/ba6c324f7a352f596d41723f94ac772bf965b7cd))
* **release:**  publish ([3af946e](https://github.com/bluelovers/yarn-tool/commit/3af946e7f168c9e712d685c4f50bd76dad36f5f3))
* **release:**  publish ([5ae570f](https://github.com/bluelovers/yarn-tool/commit/5ae570fbae22e7209cace906d7bb563433fe2d56))
* **release:**  publish ([6d90386](https://github.com/bluelovers/yarn-tool/commit/6d903868e4290b8cbdfa7305b52ff73294278740))
* **release:**  publish ([18f0853](https://github.com/bluelovers/yarn-tool/commit/18f08538a26c83bcdeeadc88416bcf01552ecb69))
* **release:**  publish ([13ce122](https://github.com/bluelovers/yarn-tool/commit/13ce122f888938586645c6ed67f02ae9fffaf52a))
*  update deps ([cded6e4](https://github.com/bluelovers/yarn-tool/commit/cded6e4dfa415c53e708424d1747707951ad097e))
* **release:**  publish ([be7e977](https://github.com/bluelovers/yarn-tool/commit/be7e97748fea9f429794431eee7c488604c6db5b))
* **release:**  publish ([62663d6](https://github.com/bluelovers/yarn-tool/commit/62663d652ac721f20ef7a60624ae64ea8a78e48f))
* **release:**  publish ([5b6e245](https://github.com/bluelovers/yarn-tool/commit/5b6e245f6ae2f509267312ee074c12bac1cfff03))
* **release:**  publish ([4fa3bb0](https://github.com/bluelovers/yarn-tool/commit/4fa3bb097a66a11aaa5bd3af49ec167087ba738a))
* **release:**  publish ([f7f552f](https://github.com/bluelovers/yarn-tool/commit/f7f552fc70dc15949f5318275ab4f458a7721308))
* **release:**  publish ([64f19d1](https://github.com/bluelovers/yarn-tool/commit/64f19d1ba808418534a3e1b8ad7774214a7c7146))
* **release:**  publish ([9f6c913](https://github.com/bluelovers/yarn-tool/commit/9f6c91316f4b7ec88fd3e3bcdfc5ceebee66cf37))
* **release:**  publish ([8123f85](https://github.com/bluelovers/yarn-tool/commit/8123f85765c9060b3b20731a5c56341672d59360))
* **release:**  publish ([5d90404](https://github.com/bluelovers/yarn-tool/commit/5d90404a76980d39883bbfd37c3a041b39fde583))
* **release:**  publish ([028eaba](https://github.com/bluelovers/yarn-tool/commit/028eaba7a2c453b6d9b557f2d7f250f6aa75bdd5))
* **release:**  publish ([7e9540e](https://github.com/bluelovers/yarn-tool/commit/7e9540ee91ebb8f083f70aede9b13e6120198392))
* **release:**  publish ([70c51d6](https://github.com/bluelovers/yarn-tool/commit/70c51d60cc933757a4397df64c24099afcf16b74))
* **release:**  publish ([73f506c](https://github.com/bluelovers/yarn-tool/commit/73f506c690a6019ba5324739d988334af53fad55))
* **release:**  publish ([c570e58](https://github.com/bluelovers/yarn-tool/commit/c570e58824b5a4b5ed08f0bf26a33894e17eabdb))
* **release:**  publish ([fd80fe2](https://github.com/bluelovers/yarn-tool/commit/fd80fe2edb675fc297d7d79942c1b885f8a002c8))
* **release:**  publish ([cf698c9](https://github.com/bluelovers/yarn-tool/commit/cf698c98b7357176846283dbf60dffcd4fd340b6))
* **release:**  publish ([1ab89ee](https://github.com/bluelovers/yarn-tool/commit/1ab89ee8b4b88b9d741901c389f2634aef302ad9))
* **release:**  publish ([c9d281e](https://github.com/bluelovers/yarn-tool/commit/c9d281ed3450c534b59e1ed41c22143fd262d602))
* **release:**  publish ([b00cc2e](https://github.com/bluelovers/yarn-tool/commit/b00cc2e1800ea40076f9b5deab57f602347602a3))
* **release:**  publish ([1d75db3](https://github.com/bluelovers/yarn-tool/commit/1d75db3c451dfbd7283df96dc3f6dde0a32c3876))
* **release:**  publish ([944116c](https://github.com/bluelovers/yarn-tool/commit/944116cebad150bceb6d283a1d7c9ccd37039298))
* **release:**  publish ([1551f9b](https://github.com/bluelovers/yarn-tool/commit/1551f9bfdc3a2f6b6900823fbf235e00b413e49e))
* **release:**  publish ([119e1f7](https://github.com/bluelovers/yarn-tool/commit/119e1f75171e320fc174226e016197c0e724724d))
* **release:**  publish ([ad5ee62](https://github.com/bluelovers/yarn-tool/commit/ad5ee628392cb8eb080098db357f74b999b53900))
* **release:**  publish ([c8e8797](https://github.com/bluelovers/yarn-tool/commit/c8e87974e70a824d69fffb29f2333167fecb605a))
* **release:**  publish ([01c8fca](https://github.com/bluelovers/yarn-tool/commit/01c8fcaab07a932128cb60b541259a4be7564bc9))
* **release:**  publish ([621b3eb](https://github.com/bluelovers/yarn-tool/commit/621b3ebf7869d92ebed96d507b82e99ad6bd72a8))
* **release:**  publish ([a0c4db2](https://github.com/bluelovers/yarn-tool/commit/a0c4db2f3b7fdf42bbc9b7cc5ae7ea84fee0d255))
* **release:**  publish ([11d85de](https://github.com/bluelovers/yarn-tool/commit/11d85de77920d090ab5921611c5331e802e907c3))
* **release:**  publish ([c1bfb78](https://github.com/bluelovers/yarn-tool/commit/c1bfb7866aa49222016bb350891146ce191346da))
* **release:**  publish ([faab2fd](https://github.com/bluelovers/yarn-tool/commit/faab2fdeff8a78780e7a4ff4731591134ac79b46))


### 🐛　Bug Fixes

*  Error: Cannot find module 'debug-color2' ([690d8a3](https://github.com/bluelovers/yarn-tool/commit/690d8a3b0462031f0060ea9bbbdb2b105216c059))
*  ...process.env, ([ce46493](https://github.com/bluelovers/yarn-tool/commit/ce46493149609e4d674573ab3e32aa4f76014fde))
*  bug of list with new yargs ([7f1629b](https://github.com/bluelovers/yarn-tool/commit/7f1629b4710814b52442ae3a856e65660e54cb6a))
*  防止 yarn.lock 不存在 導致 ncu 失敗 ([65da26a](https://github.com/bluelovers/yarn-tool/commit/65da26a90c0fa597b347491b7bae27fbf1432cdb))
*  修正路徑載入問題 ([0d91802](https://github.com/bluelovers/yarn-tool/commit/0d91802a2e5128db064b3c6cff119c0abeac8fe6))
*  修正執行 ncu 時 resolutions 不存在導致的錯誤 ([a9916ad](https://github.com/bluelovers/yarn-tool/commit/a9916ad3f633fdc3a692b54686a81ac1eed7e655))


### ✨　Features

*  try set NO_UPDATE_NOTIFIER=1 ([c06151f](https://github.com/bluelovers/yarn-tool/commit/c06151f6f03b0d5af64d437d725406913175f675))
*  use @yarn-tool/ncu ([d9a294c](https://github.com/bluelovers/yarn-tool/commit/d9a294c5e743264262ef814ba91cdab5cd024ee8))
*  use @yarn-tool/yarnlock ([a400d8f](https://github.com/bluelovers/yarn-tool/commit/a400d8f0a61dbefdc72dedc5d556abecadb40585))
*  run/exec in workspaces root ([e6e9f8a](https://github.com/bluelovers/yarn-tool/commit/e6e9f8aa3fbc5817f3f2bff2762767bbe4c33179))
*  use sort-package-json3 ([129bd66](https://github.com/bluelovers/yarn-tool/commit/129bd6695260a4f35192cfef84ccd330c481ae89))
*  support create npm-shrinkwrap ([4301358](https://github.com/bluelovers/yarn-tool/commit/43013583ee0bf0ffb10530cab5bb7d10d2fe13ba))


### Miscellaneous

* . ([67d84ed](https://github.com/bluelovers/yarn-tool/commit/67d84edf84c6f0bfcf45bd14e71ecc824e0c8e82))
* . ([4a6f039](https://github.com/bluelovers/yarn-tool/commit/4a6f03945663e22f173ad2e4bf14c7da0316fc96))
* . ([b766e55](https://github.com/bluelovers/yarn-tool/commit/b766e5521224182d3bf0dd6bf87c2d6aa981be42))
* @bluelovers/tsconfig/esm/mapfile.json ([753af0b](https://github.com/bluelovers/yarn-tool/commit/753af0b25fc370953f2d393b9256979bbd37a8a5))
* postpublish ([e6ad032](https://github.com/bluelovers/yarn-tool/commit/e6ad0329d3fa49c8989b3fa4890656b63c1f3163))
* postpublish ([9bff10b](https://github.com/bluelovers/yarn-tool/commit/9bff10bfff97c67fcb212936a37fe8b96e494039))
* postpublish ([d86d02f](https://github.com/bluelovers/yarn-tool/commit/d86d02fd4e6f09162fb17c1d6b92c90ea3653035))
* postpublish ([61d95c1](https://github.com/bluelovers/yarn-tool/commit/61d95c1a194c3af4c228deccfcd450793b3beada))
* postpublish ([bd2bd16](https://github.com/bluelovers/yarn-tool/commit/bd2bd16f7c0ef9a6773057a7240e73b9052d0798))
* . ([b8d85d5](https://github.com/bluelovers/yarn-tool/commit/b8d85d5d2e7c439b88bc32e62b8b1ce727a5b05a))
* postpublish ([35b183f](https://github.com/bluelovers/yarn-tool/commit/35b183f62c6d43ab6446b9b6ef1c1433332bc208))
* . ([02ffaad](https://github.com/bluelovers/yarn-tool/commit/02ffaad7935b02bf9dfc0b33c9d1efba97fff966))
* postpublish ([c36bf59](https://github.com/bluelovers/yarn-tool/commit/c36bf591f4e54dc04a46c875ab8eeab3005a5af9))
* postpublish ([697c64a](https://github.com/bluelovers/yarn-tool/commit/697c64ada24249a7c9515a957d878d223fa9df35))
* postpublish ([8db7307](https://github.com/bluelovers/yarn-tool/commit/8db7307487f456eda9bc1527b47651fc1ad8af4b))
* postpublish ([822eb45](https://github.com/bluelovers/yarn-tool/commit/822eb45c7e866c09d6a5f543a65ab2f63d456744))
* postpublish ([94a761b](https://github.com/bluelovers/yarn-tool/commit/94a761b65c4517bda90d0a182d9b3894ec96f10c))
* postpublish ([3dfa05f](https://github.com/bluelovers/yarn-tool/commit/3dfa05fde90b0cd26110b491c2452690051b72b2))
* postpublish ([2f73ed4](https://github.com/bluelovers/yarn-tool/commit/2f73ed4dd0116d354c7c6fad6eef1efabd3dfe2e))
* postpublish ([fa4b8ee](https://github.com/bluelovers/yarn-tool/commit/fa4b8ee432bd15201ae578169130371738d0f211))
* postpublish ([3e97a08](https://github.com/bluelovers/yarn-tool/commit/3e97a086a59377a1225331188b4afaf746864020))
* postpublish ([e9ae716](https://github.com/bluelovers/yarn-tool/commit/e9ae716692b0882929c9d8fd89da859164c62235))
* postpublish ([8c965e9](https://github.com/bluelovers/yarn-tool/commit/8c965e98e65c408a004ea10febd7cd4565450b6a))
* postpublish ([63daec1](https://github.com/bluelovers/yarn-tool/commit/63daec11a8b2b73c571670e0cb973526017e3eeb))
* postpublish ([7d614b1](https://github.com/bluelovers/yarn-tool/commit/7d614b1b570804c34649386ab0c5244cb0666285))
* postpublish ([5747783](https://github.com/bluelovers/yarn-tool/commit/5747783c9bb29ea400d9f80ca1419a67eacb82e2))
* postpublish ([1cf1629](https://github.com/bluelovers/yarn-tool/commit/1cf1629f251cd0d5c0582e9c3e3b23768fc5a4b0))
* postpublish ([ed27d16](https://github.com/bluelovers/yarn-tool/commit/ed27d16c279ecfc42eba3d85ac88e8832eff656c))
* postpublish ([d7f2d7d](https://github.com/bluelovers/yarn-tool/commit/d7f2d7dbd780b3ae6676ba695c0f8229225661dc))
* postpublish ([e58fc7d](https://github.com/bluelovers/yarn-tool/commit/e58fc7dc9e8af1d48363e156e4d6634bae35d464))
* postpublish ([08acfa4](https://github.com/bluelovers/yarn-tool/commit/08acfa4ec590c778c9101c6981c3842ab0a4eb4a))
* postpublish ([0df90f3](https://github.com/bluelovers/yarn-tool/commit/0df90f30201d4a887b41f47c23e93fc3eef7fd9d))
* postpublish ([693f6c0](https://github.com/bluelovers/yarn-tool/commit/693f6c0ef9dd6897f9934d050585c4fd0b2f5815))
* postpublish ([cbdc855](https://github.com/bluelovers/yarn-tool/commit/cbdc8554e5ceca11dffedbd1d0a308f65603e4bc))
* postpublish ([8eb6a05](https://github.com/bluelovers/yarn-tool/commit/8eb6a0514bb4c4bdceffbf7cb27e5427a27904c2))
* . ([102110d](https://github.com/bluelovers/yarn-tool/commit/102110d82781d6767ba65bec4d306bbc474ea50d))
* postpublish ([e3ff0de](https://github.com/bluelovers/yarn-tool/commit/e3ff0de3d23c4ee23fdaa54107b3585da55779c0))
* postpublish ([f955d95](https://github.com/bluelovers/yarn-tool/commit/f955d95a82f04fbbf14c91380e024d8387ddea22))
* postpublish ([1d3a73b](https://github.com/bluelovers/yarn-tool/commit/1d3a73bed2256eaab3bef0b2c619e9c386a1aa53))
* postpublish ([86c413d](https://github.com/bluelovers/yarn-tool/commit/86c413d2c3f3023f91dc7f55b3e4839a55589d55))
* .0.18 ([d9edd7a](https://github.com/bluelovers/yarn-tool/commit/d9edd7aa4f12bbb8f18cf201d7e6e4e77100527d))
* . ([61fd59a](https://github.com/bluelovers/yarn-tool/commit/61fd59a1485fae85cc6f97f0570a5fcfea2cac31))
* . ([6f0c446](https://github.com/bluelovers/yarn-tool/commit/6f0c44607aa0daa6b5fc182f8f44e4558e5748d8))
* . ([bdc39d1](https://github.com/bluelovers/yarn-tool/commit/bdc39d1e3f7c55f34f04ddae36cc12b00f804e22))
* support when resolutions version is '*' ([5cf77f1](https://github.com/bluelovers/yarn-tool/commit/5cf77f12ac45e0cfeeaa48627573fea260512384))
* . ([9b55f2f](https://github.com/bluelovers/yarn-tool/commit/9b55f2f438adafff4160bb7853ddd7d4b5482859))
* . ([fdd744b](https://github.com/bluelovers/yarn-tool/commit/fdd744b414b6af5da844af5432d16d211d255768))
* . ([5de0f80](https://github.com/bluelovers/yarn-tool/commit/5de0f80cf859051c4b7e70168b4b07a92f4cc9b5))
* upath2 ([47990be](https://github.com/bluelovers/yarn-tool/commit/47990be1254c1ca35f7f03e906a2b55d7777cb96))
* . ([f72d34d](https://github.com/bluelovers/yarn-tool/commit/f72d34d7d2d7633b40265028b85fff827cbb2358))
* update diff style ([05ce1b3](https://github.com/bluelovers/yarn-tool/commit/05ce1b318f6ea1dd883af90ffa536d5cc733b95e))
* bug: Fixing a bug. ([15face5](https://github.com/bluelovers/yarn-tool/commit/15face5eb8ab5349c38f2c20495e12272094719d))
* yargs.commandDir ([ef7d530](https://github.com/bluelovers/yarn-tool/commit/ef7d530f6adc1feb194ab407f4eed0f1debc192e))
* yt sort , yt ws run ([08e0334](https://github.com/bluelovers/yarn-tool/commit/08e033441a427b78de23b9168cd4d1123f1c054d))
* yt init , yt ws init ([f8b09f5](https://github.com/bluelovers/yarn-tool/commit/f8b09f59cc1de5298bce0b39c92b8aa8453cb162))
* . ([4ceaf8e](https://github.com/bluelovers/yarn-tool/commit/4ceaf8efb694611dd0dc654d1e0721e9bf9cc7e2))
* . ([468c5f1](https://github.com/bluelovers/yarn-tool/commit/468c5f1ea41bc1d45b0716eb7ec8cdfda43a511a))
* yarn-tool@1.0.8 ([f5a8935](https://github.com/bluelovers/yarn-tool/commit/f5a89352ce24a016cc12a6b7c9577c71c2c13743))
* update pkg ([f1890e7](https://github.com/bluelovers/yarn-tool/commit/f1890e76acde39a9582aaf15be4fb40f0a680677))
* 簡化以後 增加命令時的步驟 ([086e0fc](https://github.com/bluelovers/yarn-tool/commit/086e0fccfe1fc30e58807441fc739565feab6270))
* better message if can't found root ([1fe728c](https://github.com/bluelovers/yarn-tool/commit/1fe728c47c527208c6cddb7a3512e9484a187e88))
* . ([9aa93bb](https://github.com/bluelovers/yarn-tool/commit/9aa93bb4a65e573a3bfdd682a9c86814fb77fb53))
* !/usr/bin/env node ([9adfde8](https://github.com/bluelovers/yarn-tool/commit/9adfde859e92503218daec6469d5caaad70ff4a5))
* . ([894b2e7](https://github.com/bluelovers/yarn-tool/commit/894b2e707f54ae089e5fe3396b9862cf35a40f19))
* . ([615c48c](https://github.com/bluelovers/yarn-tool/commit/615c48cb5e09b2af64296da350a50f036f4d0b64))
* tada: npm publish for ensure this name can be use ([ff3775e](https://github.com/bluelovers/yarn-tool/commit/ff3775e44eb6a408b15a1b79af3976030099ea7f))
* . ([695f366](https://github.com/bluelovers/yarn-tool/commit/695f36644ecd913c82c6e15673c142f857e657cf))





## 1.0.93 (2020-06-15)


### 🐛　Bug Fixes

*  Error: Cannot find module 'debug-color2' ([690d8a3](https://github.com/bluelovers/yarn-tool/commit/690d8a3b0462031f0060ea9bbbdb2b105216c059))
*  ...process.env, ([ce46493](https://github.com/bluelovers/yarn-tool/commit/ce46493149609e4d674573ab3e32aa4f76014fde))
*  bug of list with new yargs ([7f1629b](https://github.com/bluelovers/yarn-tool/commit/7f1629b4710814b52442ae3a856e65660e54cb6a))
*  防止 yarn.lock 不存在 導致 ncu 失敗 ([65da26a](https://github.com/bluelovers/yarn-tool/commit/65da26a90c0fa597b347491b7bae27fbf1432cdb))
*  修正路徑載入問題 ([0d91802](https://github.com/bluelovers/yarn-tool/commit/0d91802a2e5128db064b3c6cff119c0abeac8fe6))
*  修正執行 ncu 時 resolutions 不存在導致的錯誤 ([a9916ad](https://github.com/bluelovers/yarn-tool/commit/a9916ad3f633fdc3a692b54686a81ac1eed7e655))


### ♻️　Chores

*  update deps ([620f85d](https://github.com/bluelovers/yarn-tool/commit/620f85d0dc36dbc7423894ee21163f61fb09205d))
* **release:**  publish ([ba6c324](https://github.com/bluelovers/yarn-tool/commit/ba6c324f7a352f596d41723f94ac772bf965b7cd))
* **release:**  publish ([3af946e](https://github.com/bluelovers/yarn-tool/commit/3af946e7f168c9e712d685c4f50bd76dad36f5f3))
* **release:**  publish ([5ae570f](https://github.com/bluelovers/yarn-tool/commit/5ae570fbae22e7209cace906d7bb563433fe2d56))
* **release:**  publish ([6d90386](https://github.com/bluelovers/yarn-tool/commit/6d903868e4290b8cbdfa7305b52ff73294278740))
* **release:**  publish ([18f0853](https://github.com/bluelovers/yarn-tool/commit/18f08538a26c83bcdeeadc88416bcf01552ecb69))
* **release:**  publish ([13ce122](https://github.com/bluelovers/yarn-tool/commit/13ce122f888938586645c6ed67f02ae9fffaf52a))
*  update deps ([cded6e4](https://github.com/bluelovers/yarn-tool/commit/cded6e4dfa415c53e708424d1747707951ad097e))
* **release:**  publish ([be7e977](https://github.com/bluelovers/yarn-tool/commit/be7e97748fea9f429794431eee7c488604c6db5b))
* **release:**  publish ([62663d6](https://github.com/bluelovers/yarn-tool/commit/62663d652ac721f20ef7a60624ae64ea8a78e48f))
* **release:**  publish ([5b6e245](https://github.com/bluelovers/yarn-tool/commit/5b6e245f6ae2f509267312ee074c12bac1cfff03))
* **release:**  publish ([4fa3bb0](https://github.com/bluelovers/yarn-tool/commit/4fa3bb097a66a11aaa5bd3af49ec167087ba738a))
* **release:**  publish ([f7f552f](https://github.com/bluelovers/yarn-tool/commit/f7f552fc70dc15949f5318275ab4f458a7721308))
* **release:**  publish ([64f19d1](https://github.com/bluelovers/yarn-tool/commit/64f19d1ba808418534a3e1b8ad7774214a7c7146))
* **release:**  publish ([9f6c913](https://github.com/bluelovers/yarn-tool/commit/9f6c91316f4b7ec88fd3e3bcdfc5ceebee66cf37))
* **release:**  publish ([8123f85](https://github.com/bluelovers/yarn-tool/commit/8123f85765c9060b3b20731a5c56341672d59360))
* **release:**  publish ([5d90404](https://github.com/bluelovers/yarn-tool/commit/5d90404a76980d39883bbfd37c3a041b39fde583))
* **release:**  publish ([028eaba](https://github.com/bluelovers/yarn-tool/commit/028eaba7a2c453b6d9b557f2d7f250f6aa75bdd5))
* **release:**  publish ([7e9540e](https://github.com/bluelovers/yarn-tool/commit/7e9540ee91ebb8f083f70aede9b13e6120198392))
* **release:**  publish ([70c51d6](https://github.com/bluelovers/yarn-tool/commit/70c51d60cc933757a4397df64c24099afcf16b74))
* **release:**  publish ([73f506c](https://github.com/bluelovers/yarn-tool/commit/73f506c690a6019ba5324739d988334af53fad55))
* **release:**  publish ([c570e58](https://github.com/bluelovers/yarn-tool/commit/c570e58824b5a4b5ed08f0bf26a33894e17eabdb))
* **release:**  publish ([fd80fe2](https://github.com/bluelovers/yarn-tool/commit/fd80fe2edb675fc297d7d79942c1b885f8a002c8))
* **release:**  publish ([cf698c9](https://github.com/bluelovers/yarn-tool/commit/cf698c98b7357176846283dbf60dffcd4fd340b6))
* **release:**  publish ([1ab89ee](https://github.com/bluelovers/yarn-tool/commit/1ab89ee8b4b88b9d741901c389f2634aef302ad9))
* **release:**  publish ([c9d281e](https://github.com/bluelovers/yarn-tool/commit/c9d281ed3450c534b59e1ed41c22143fd262d602))
* **release:**  publish ([b00cc2e](https://github.com/bluelovers/yarn-tool/commit/b00cc2e1800ea40076f9b5deab57f602347602a3))
* **release:**  publish ([1d75db3](https://github.com/bluelovers/yarn-tool/commit/1d75db3c451dfbd7283df96dc3f6dde0a32c3876))
* **release:**  publish ([944116c](https://github.com/bluelovers/yarn-tool/commit/944116cebad150bceb6d283a1d7c9ccd37039298))
* **release:**  publish ([1551f9b](https://github.com/bluelovers/yarn-tool/commit/1551f9bfdc3a2f6b6900823fbf235e00b413e49e))
* **release:**  publish ([119e1f7](https://github.com/bluelovers/yarn-tool/commit/119e1f75171e320fc174226e016197c0e724724d))
* **release:**  publish ([ad5ee62](https://github.com/bluelovers/yarn-tool/commit/ad5ee628392cb8eb080098db357f74b999b53900))
* **release:**  publish ([c8e8797](https://github.com/bluelovers/yarn-tool/commit/c8e87974e70a824d69fffb29f2333167fecb605a))
* **release:**  publish ([01c8fca](https://github.com/bluelovers/yarn-tool/commit/01c8fcaab07a932128cb60b541259a4be7564bc9))
* **release:**  publish ([621b3eb](https://github.com/bluelovers/yarn-tool/commit/621b3ebf7869d92ebed96d507b82e99ad6bd72a8))
* **release:**  publish ([a0c4db2](https://github.com/bluelovers/yarn-tool/commit/a0c4db2f3b7fdf42bbc9b7cc5ae7ea84fee0d255))
* **release:**  publish ([11d85de](https://github.com/bluelovers/yarn-tool/commit/11d85de77920d090ab5921611c5331e802e907c3))
* **release:**  publish ([c1bfb78](https://github.com/bluelovers/yarn-tool/commit/c1bfb7866aa49222016bb350891146ce191346da))
* **release:**  publish ([faab2fd](https://github.com/bluelovers/yarn-tool/commit/faab2fdeff8a78780e7a4ff4731591134ac79b46))


### ✨　Features

*  try set NO_UPDATE_NOTIFIER=1 ([c06151f](https://github.com/bluelovers/yarn-tool/commit/c06151f6f03b0d5af64d437d725406913175f675))
*  use @yarn-tool/ncu ([d9a294c](https://github.com/bluelovers/yarn-tool/commit/d9a294c5e743264262ef814ba91cdab5cd024ee8))
*  use @yarn-tool/yarnlock ([a400d8f](https://github.com/bluelovers/yarn-tool/commit/a400d8f0a61dbefdc72dedc5d556abecadb40585))
*  run/exec in workspaces root ([e6e9f8a](https://github.com/bluelovers/yarn-tool/commit/e6e9f8aa3fbc5817f3f2bff2762767bbe4c33179))
*  use sort-package-json3 ([129bd66](https://github.com/bluelovers/yarn-tool/commit/129bd6695260a4f35192cfef84ccd330c481ae89))
*  support create npm-shrinkwrap ([4301358](https://github.com/bluelovers/yarn-tool/commit/43013583ee0bf0ffb10530cab5bb7d10d2fe13ba))


### Miscellaneous

* . ([4a6f039](https://github.com/bluelovers/yarn-tool/commit/4a6f03945663e22f173ad2e4bf14c7da0316fc96))
* . ([b766e55](https://github.com/bluelovers/yarn-tool/commit/b766e5521224182d3bf0dd6bf87c2d6aa981be42))
* @bluelovers/tsconfig/esm/mapfile.json ([753af0b](https://github.com/bluelovers/yarn-tool/commit/753af0b25fc370953f2d393b9256979bbd37a8a5))
* postpublish ([e6ad032](https://github.com/bluelovers/yarn-tool/commit/e6ad0329d3fa49c8989b3fa4890656b63c1f3163))
* postpublish ([9bff10b](https://github.com/bluelovers/yarn-tool/commit/9bff10bfff97c67fcb212936a37fe8b96e494039))
* postpublish ([d86d02f](https://github.com/bluelovers/yarn-tool/commit/d86d02fd4e6f09162fb17c1d6b92c90ea3653035))
* postpublish ([61d95c1](https://github.com/bluelovers/yarn-tool/commit/61d95c1a194c3af4c228deccfcd450793b3beada))
* postpublish ([bd2bd16](https://github.com/bluelovers/yarn-tool/commit/bd2bd16f7c0ef9a6773057a7240e73b9052d0798))
* . ([b8d85d5](https://github.com/bluelovers/yarn-tool/commit/b8d85d5d2e7c439b88bc32e62b8b1ce727a5b05a))
* postpublish ([35b183f](https://github.com/bluelovers/yarn-tool/commit/35b183f62c6d43ab6446b9b6ef1c1433332bc208))
* . ([02ffaad](https://github.com/bluelovers/yarn-tool/commit/02ffaad7935b02bf9dfc0b33c9d1efba97fff966))
* postpublish ([c36bf59](https://github.com/bluelovers/yarn-tool/commit/c36bf591f4e54dc04a46c875ab8eeab3005a5af9))
* postpublish ([697c64a](https://github.com/bluelovers/yarn-tool/commit/697c64ada24249a7c9515a957d878d223fa9df35))
* postpublish ([8db7307](https://github.com/bluelovers/yarn-tool/commit/8db7307487f456eda9bc1527b47651fc1ad8af4b))
* postpublish ([822eb45](https://github.com/bluelovers/yarn-tool/commit/822eb45c7e866c09d6a5f543a65ab2f63d456744))
* postpublish ([94a761b](https://github.com/bluelovers/yarn-tool/commit/94a761b65c4517bda90d0a182d9b3894ec96f10c))
* postpublish ([3dfa05f](https://github.com/bluelovers/yarn-tool/commit/3dfa05fde90b0cd26110b491c2452690051b72b2))
* postpublish ([2f73ed4](https://github.com/bluelovers/yarn-tool/commit/2f73ed4dd0116d354c7c6fad6eef1efabd3dfe2e))
* postpublish ([fa4b8ee](https://github.com/bluelovers/yarn-tool/commit/fa4b8ee432bd15201ae578169130371738d0f211))
* postpublish ([3e97a08](https://github.com/bluelovers/yarn-tool/commit/3e97a086a59377a1225331188b4afaf746864020))
* postpublish ([e9ae716](https://github.com/bluelovers/yarn-tool/commit/e9ae716692b0882929c9d8fd89da859164c62235))
* postpublish ([8c965e9](https://github.com/bluelovers/yarn-tool/commit/8c965e98e65c408a004ea10febd7cd4565450b6a))
* postpublish ([63daec1](https://github.com/bluelovers/yarn-tool/commit/63daec11a8b2b73c571670e0cb973526017e3eeb))
* postpublish ([7d614b1](https://github.com/bluelovers/yarn-tool/commit/7d614b1b570804c34649386ab0c5244cb0666285))
* postpublish ([5747783](https://github.com/bluelovers/yarn-tool/commit/5747783c9bb29ea400d9f80ca1419a67eacb82e2))
* postpublish ([1cf1629](https://github.com/bluelovers/yarn-tool/commit/1cf1629f251cd0d5c0582e9c3e3b23768fc5a4b0))
* postpublish ([ed27d16](https://github.com/bluelovers/yarn-tool/commit/ed27d16c279ecfc42eba3d85ac88e8832eff656c))
* postpublish ([d7f2d7d](https://github.com/bluelovers/yarn-tool/commit/d7f2d7dbd780b3ae6676ba695c0f8229225661dc))
* postpublish ([e58fc7d](https://github.com/bluelovers/yarn-tool/commit/e58fc7dc9e8af1d48363e156e4d6634bae35d464))
* postpublish ([08acfa4](https://github.com/bluelovers/yarn-tool/commit/08acfa4ec590c778c9101c6981c3842ab0a4eb4a))
* postpublish ([0df90f3](https://github.com/bluelovers/yarn-tool/commit/0df90f30201d4a887b41f47c23e93fc3eef7fd9d))
* postpublish ([693f6c0](https://github.com/bluelovers/yarn-tool/commit/693f6c0ef9dd6897f9934d050585c4fd0b2f5815))
* postpublish ([cbdc855](https://github.com/bluelovers/yarn-tool/commit/cbdc8554e5ceca11dffedbd1d0a308f65603e4bc))
* postpublish ([8eb6a05](https://github.com/bluelovers/yarn-tool/commit/8eb6a0514bb4c4bdceffbf7cb27e5427a27904c2))
* . ([102110d](https://github.com/bluelovers/yarn-tool/commit/102110d82781d6767ba65bec4d306bbc474ea50d))
* postpublish ([e3ff0de](https://github.com/bluelovers/yarn-tool/commit/e3ff0de3d23c4ee23fdaa54107b3585da55779c0))
* postpublish ([f955d95](https://github.com/bluelovers/yarn-tool/commit/f955d95a82f04fbbf14c91380e024d8387ddea22))
* postpublish ([1d3a73b](https://github.com/bluelovers/yarn-tool/commit/1d3a73bed2256eaab3bef0b2c619e9c386a1aa53))
* postpublish ([86c413d](https://github.com/bluelovers/yarn-tool/commit/86c413d2c3f3023f91dc7f55b3e4839a55589d55))
* .0.18 ([d9edd7a](https://github.com/bluelovers/yarn-tool/commit/d9edd7aa4f12bbb8f18cf201d7e6e4e77100527d))
* . ([61fd59a](https://github.com/bluelovers/yarn-tool/commit/61fd59a1485fae85cc6f97f0570a5fcfea2cac31))
* . ([6f0c446](https://github.com/bluelovers/yarn-tool/commit/6f0c44607aa0daa6b5fc182f8f44e4558e5748d8))
* . ([bdc39d1](https://github.com/bluelovers/yarn-tool/commit/bdc39d1e3f7c55f34f04ddae36cc12b00f804e22))
* support when resolutions version is '*' ([5cf77f1](https://github.com/bluelovers/yarn-tool/commit/5cf77f12ac45e0cfeeaa48627573fea260512384))
* . ([9b55f2f](https://github.com/bluelovers/yarn-tool/commit/9b55f2f438adafff4160bb7853ddd7d4b5482859))
* . ([fdd744b](https://github.com/bluelovers/yarn-tool/commit/fdd744b414b6af5da844af5432d16d211d255768))
* . ([5de0f80](https://github.com/bluelovers/yarn-tool/commit/5de0f80cf859051c4b7e70168b4b07a92f4cc9b5))
* upath2 ([47990be](https://github.com/bluelovers/yarn-tool/commit/47990be1254c1ca35f7f03e906a2b55d7777cb96))
* . ([f72d34d](https://github.com/bluelovers/yarn-tool/commit/f72d34d7d2d7633b40265028b85fff827cbb2358))
* update diff style ([05ce1b3](https://github.com/bluelovers/yarn-tool/commit/05ce1b318f6ea1dd883af90ffa536d5cc733b95e))
* bug: Fixing a bug. ([15face5](https://github.com/bluelovers/yarn-tool/commit/15face5eb8ab5349c38f2c20495e12272094719d))
* yargs.commandDir ([ef7d530](https://github.com/bluelovers/yarn-tool/commit/ef7d530f6adc1feb194ab407f4eed0f1debc192e))
* yt sort , yt ws run ([08e0334](https://github.com/bluelovers/yarn-tool/commit/08e033441a427b78de23b9168cd4d1123f1c054d))
* yt init , yt ws init ([f8b09f5](https://github.com/bluelovers/yarn-tool/commit/f8b09f59cc1de5298bce0b39c92b8aa8453cb162))
* . ([4ceaf8e](https://github.com/bluelovers/yarn-tool/commit/4ceaf8efb694611dd0dc654d1e0721e9bf9cc7e2))
* . ([468c5f1](https://github.com/bluelovers/yarn-tool/commit/468c5f1ea41bc1d45b0716eb7ec8cdfda43a511a))
* yarn-tool@1.0.8 ([f5a8935](https://github.com/bluelovers/yarn-tool/commit/f5a89352ce24a016cc12a6b7c9577c71c2c13743))
* update pkg ([f1890e7](https://github.com/bluelovers/yarn-tool/commit/f1890e76acde39a9582aaf15be4fb40f0a680677))
* 簡化以後 增加命令時的步驟 ([086e0fc](https://github.com/bluelovers/yarn-tool/commit/086e0fccfe1fc30e58807441fc739565feab6270))
* better message if can't found root ([1fe728c](https://github.com/bluelovers/yarn-tool/commit/1fe728c47c527208c6cddb7a3512e9484a187e88))
* . ([9aa93bb](https://github.com/bluelovers/yarn-tool/commit/9aa93bb4a65e573a3bfdd682a9c86814fb77fb53))
* !/usr/bin/env node ([9adfde8](https://github.com/bluelovers/yarn-tool/commit/9adfde859e92503218daec6469d5caaad70ff4a5))
* . ([894b2e7](https://github.com/bluelovers/yarn-tool/commit/894b2e707f54ae089e5fe3396b9862cf35a40f19))
* . ([615c48c](https://github.com/bluelovers/yarn-tool/commit/615c48cb5e09b2af64296da350a50f036f4d0b64))
* tada: npm publish for ensure this name can be use ([ff3775e](https://github.com/bluelovers/yarn-tool/commit/ff3775e44eb6a408b15a1b79af3976030099ea7f))
* . ([695f366](https://github.com/bluelovers/yarn-tool/commit/695f36644ecd913c82c6e15673c142f857e657cf))
