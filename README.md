# amazon-baby-registry-gift-list-export

A Tampermonkey script that iterates over your thank you list in the Amazon Baby Registry and creates a report of gifter names, gifter addresses and product titles.

## Why

When it came time to send out thanks to the people who sent me baby registry gifts, I didn't want to click each detail button. This script mocks a request to the gift detail on the baby registry thank you page and gathers each address (if provied), then downloads a CSV export. 

## How to install

> Note: You must have the [Tampermonkey](https://www.tampermonkey.net) extension installed on your browser.

[Click here to install](https://github.com/dmart914/amazon-baby-registry-gift-list-export/raw/main/gift-list-export.user.js)

## How to use
Each registry has some unique identifying parameters that need to be placed into the script to work properly. They can be found in the POST request when clicking the "More details" button on a purchased item on the "Thank you & returns" page.

If you do not know how to find the parameters try the following:
### Finding registry parameters and updating the script
1. Log into your Amazon registry
2. Open the developer tools
3. Click the Network tab
4. Clear the tab by clicking the trashcan icon, "no" icon, or whatever is required to clear the network log.
5. On the Amazon registry, click "More details". This will send a POST request to the Amazon server with the required parameters. They will be under the "Request" tab.
6. Click on the POST request, then click on "Request"  
![image](https://github.com/user-attachments/assets/c84877cd-b154-454a-a754-44c08a4c7197)  
7. Copy paste the relevant parameters into the script near the top and save the script.  
![image](https://github.com/user-attachments/assets/f0a01b5f-5963-412b-a256-7f9a5c68ade8)  
   7.1 Optionally update your file delimiter. If left as a comma, it should seemlessly open in Excel.
8. Reload the Amazon registry page to make sure the updated script is loaded


### How to run the script
1. Make sure the Tampermonkey script is activated and you have updated the script with the parameters from your registry
2. Click the "Export gift details" button on the right side of the page.
![image](https://github.com/user-attachments/assets/d0e3fa1f-dc45-421c-8b1b-242280f5520c)  
   * The button may instead be on the left side.


## It doesn't work!

File an issue or put up a PR. This script is a bit delicate as it relies on the order of certain elements. Any changes to the page UI could break the script. I've tried to comment the source code to make it clear where to modify those queries. 
