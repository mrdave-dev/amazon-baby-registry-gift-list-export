# amazon-baby-registry-gift-list-export

A Tampermonkey script that iterates over your thank you list in the Amazon Baby Registry and creates a report of gifter names, gifter addresses and product titles.

## Why

When it came time to send out thanks to the people who sent me baby registry gifts, I didn't want to click each detail button. This script mocks a request to the gift detail on the baby registry thank you page and gathers each address (if provied), then downloads a CSV export. 

## How to install

> Note: You must have the [Tampermonkey](https://www.tampermonkey.net) extension installed on your browser.

[Click here to install](https://github.com/dmart914/amazon-baby-registry-gift-list-export/raw/main/gift-list-export.user.js)

## How to use

Click the "Export gift details" button on the left side, just below the number of items.

## It doesn't work!

File an issue or put up a PR. This script is a bit delicate as it relies on the order of certain elements. Any changes to the page UI could break the script. I've tried to comment the source code to make it clear where to modify those queries. 
