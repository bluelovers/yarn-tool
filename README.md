# README

    a yarn cli tool helper

## install

### npm install

> recommend use `npx` way

```
npm install -g yarn yarn-tool
```

> u can use alias name `yt` instead of `yarn-tool`, when installed

```
yt <command> 
```

### npx

```
npx yarn-tool <command> 
```

## Usage

### help

> yt --help  
> yt \<cmd\> --help

```
$ yarn-tool --help
yt <command>

Commands:
  yt add [name]     Installs a package
  yt bin            Get the path to a binary script.
  yt create         create a npm package or update package.json file
  yt dedupe [cwd]   package deduplication for yarn.lock             [aliases: d]
  yt dlx            Run a package in a temporary environment. require yarn
                    version >= 2
  yt init           create a npm package or update package.json file
  yt install [cwd]  do dedupe with yarn install                     [aliases: i]
  yt link           Symlink a package folder during development.
  yt list           List installed packages.
  yt lockfile       show yarn.lock info
  yt ncu [-u]       Find newer versions of dependencies than what your
                    package.json allows                        [aliases: update]
  yt node           Run node with the hook already setup.
  yt pack           Creates a compressed gzip archive of package dependencies.
  yt publish        publish a npm package                        [aliases: push]
  yt remove         Running yarn remove foo will remove the package named foo
                    from your direct dependencies updating your package.json and
                    yarn.lock files in the process.                [aliases: rm]
  yt run            Runs a defined package script.
  yt sort           sort package.json file
  yt test           Runs the test script defined by the package.
  yt types [name]   Installs @types/* of packages if not exists in package.json
  yt unlink         To remove a symlinked package created with yarn link, yarn
                    unlink can be used.
  yt unplug         Temporarily copies a package (with an optional @range
                    suffix) outside of the global cache for debugging purposes
                                                                 [aliases: upnp]
  yt upgrade        Symlink a package folder during development.
                                                          [aliases: upgrade, up]
  yt versions       Displays version information of the currently installed
                    Yarn, Node.js, and its dependencies.
  yt why            Show information about why a package is installed.
  yt ws <cmd>       yarn workspaces         [aliases: ws, workspaces, workspace]

Options:
  --cwd                 current working directory or package directory
                                                [string] [default: "G:\Users\The
              Project\nodejs-yarn\ws-create-yarn-workspaces\packages\yarn-tool"]
  --skipCheckWorkspace  this options is for search yarn.lock, pkg root,
                        workspace root, not same as
                        --ignore-workspace-root-check                  [boolean]
  --yt-debug-mode                                                      [boolean]
  -v, --version         Show version number                            [boolean]
  -h, --help            Show help                                      [boolean]
```

#### yt ws

```
yt ws <cmd>

yarn workspaces

命令：
  yt ws add     Installs a package in workspaces.
  yt ws info    Show information about your workspaces.
  yt ws init    create yarn workspaces
  yt ws remove  Remove a package in workspaces.
  yt ws run     run script by lerna
  yt ws exec    Execute an arbitrary command in each package
```

#### yt ncu
```
yt ncu [-u]

Find newer versions of dependencies than what your package.json or bower.json
allows

選項：
  --version             顯示版本                                          [布林]
  --cwd                 current working directory or package directory
                                                   [字串] [預設值: "G:\Users\The
              Project\nodejs-yarn\ws-create-yarn-workspaces\packages\yarn-tool"]
  --skipCheckWorkspace  this options is for search yarn.lock, pkg root,
                        workspace root, not same as
                        --ignore-workspace-root-check                     [布林]
  --yt-debug-mode                                                         [布林]
  --help                顯示說明                                          [布林]
  --dep                 check only a specific section(s) of dependencies:
                        prod|dev|peer|optional|bundle (comma-delimited)   [字串]
  --minimal, -m         do not upgrade newer versions that are already satisfied
                        by the version range according to semver          [布林]
  --newest, -n          find the newest versions available instead of the latest
                        stable versions                                   [布林]
  --packageManager, -p  npm (default) or bower            [字串] [預設值: "npm"]
  --registry, -r        specify third-party npm registry                  [字串]
  --silent, -s          don't output anything (--loglevel silent)         [布林]
  --greatest, -g        find the highest versions available instead of the
                        latest stable versions                            [布林]
  --upgrade, -u         overwrite package file                            [布林]
  --semverLevel         find the highest version within "major" or "minor"[字串]
  --removeRange         remove version ranges from the final package version
                                                                          [布林]
  --dedupe              remove upgrade module from resolutions
                                                           [布林] [預設值: true]
```

#### yt add

```
yt add [name]

Installs a package

選項：
  --version                          顯示版本                             [布林]
  --cwd                              current working directory or package
                                     directory     [字串] [預設值: "G:\Users\The
              Project\nodejs-yarn\ws-create-yarn-workspaces\packages\yarn-tool"]
  --skipCheckWorkspace               this options is for search yarn.lock, pkg
                                     root, workspace root, not same as
                                     --ignore-workspace-root-check        [布林]
  --yt-debug-mode                                                         [布林]
  --help                             顯示說明                             [布林]
  --dev, -D                          install packages to devDependencies. [布林]
  --peer, -P                         install packages to peerDependencies.[布林]
  --optional, -O                     install packages to optionalDependencies.
                                                                          [布林]
  --exact, -E                        see
                                     https://yarnpkg.com/lang/en/docs/cli/add/
                                                                          [布林]
  --tilde, -T                        see
                                     https://yarnpkg.com/lang/en/docs/cli/add/
                                                                          [布林]
  --audit                            see
                                     https://yarnpkg.com/lang/en/docs/cli/add/
                                                                          [布林]
  --name                                                           [字串] [必須]
  --dedupe, -d                       Data deduplication for yarn.lock
                                                           [布林] [預設值: true]
  --ignore-workspace-root-check, -W  see
                                     https://yarnpkg.com/lang/en/docs/cli/add/
                                                                          [布林]
  --types, --type                    try auto install @types/* too        [布林]
```


### install

> this same as `yarn`, but will do dedupe

```
npx yarn-tool install
```

### dedupe

> Data deduplication for yarn.lock

```
npx yarn-tool dedupe
```

```
npx yarn-tool dedupe C:/xxxx/packages/name
```

```
npx yarn-tool dedupe .
```

### add

> this same as `yarn add [name]`, but will do dedupe before install by default

```
npx yarn-tool add @bluelovers/tsconfig -D
```

### help

> Show help

```
npx yarn-tool help
```

```
npx yarn-tool --help
```
