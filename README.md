This repository is logic that calculating rewards for [Dev](https://devtoken.rocks) beta.

A new protocol called [Dev Protocol](https://github.com/dev-protocol/protocol) is under development. In the deployed, this repository is no longer needed.

---

[![Build Status](https://travis-ci.org/frame00/dev-distribution.svg?branch=master)](https://travis-ci.org/frame00/dev-distribution)

# Getting Started

How to install:

```bash
git clone git@github.com:frame00/dev-distribution.git
cd dev-distribution
npm i
```

# How to Calculate

Distribution rate calculation:

```bash
npm run calc 2018-07-20 2018-08-19 1000000
```

`npm run calc <start date> <end date> <total distributions>`
