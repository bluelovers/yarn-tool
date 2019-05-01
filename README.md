# README

    a yarn cli tool helper

## install

### npm install

> recommend use `npx` way

```
npm install -g yarn-tool
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
