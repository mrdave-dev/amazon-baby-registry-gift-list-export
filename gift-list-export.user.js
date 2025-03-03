// ==UserScript==
// @name         amazon-baby-registry-gift-list-export
// @namespace    https://mrdave.dev
// @updateURL    https://github.com/mrdave-dev/amazon-baby-registry-gift-list-export/raw/main/gift-list-export.user.js
// @downloadURL  https://github.com/mrdave-dev/amazon-baby-registry-gift-list-export/raw/main/gift-list-export.user.js
// @version      1.0.1
// @description  Combines listings in the Amazon baby registry thank you list in to a single CSV document and downloads
// @author       Dave Martinez, https://mrdave.dev
// @match        https://www.amazon.com/baby-reg/thankyoulist*
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  // Adds export button
  const exportButton = document.createElement('button')
  exportButton.className = 'a-button a-button-base'
  exportButton.innerHTML = '<span class="a-button-inner"><span class="a-button-text">Export gift details</span></span>'

  exportButton.addEventListener('click', async () => {
    
    // Requests need a CSRF token; we find it on the page and store it
    const tokenQuery = Array.from(document.querySelectorAll('script[data-a-state]'))
      .map(result => {
        try {
          return JSON.parse(result.innerHTML).token
        } catch (e) {
          return null
        }
      })
      .filter(result => !!result)


    // If we can't find the token, we won't be able to get the addresses
    if (tokenQuery.length !== 1) {
      throw new Error('Cannot find CSRF token; unable to export details')
    }

    const token = tokenQuery[0]

    // Each item row has a `data-a-modal` attribute with data for the modal
    const itemQueryResults = Array.from(document.querySelectorAll(`script[type=a-state][data-a-state='{"key":"tylDetailPageState"}']`))
      .map(result => {
        try {
          const modalData = JSON.parse(result.innerText)
          return modalData
        } catch (e) {
          return null
        }
      })
      .filter(result => {
        return !!result && !!result.gift
      })
      .map(({ gift, registryId, index, isPrimaryRegistrant }) => new Promise((resolve, reject) => {

        const giftRequest = {
          gift,
          registryId,
          index,
          primaryRegistrant: isPrimaryRegistrant
        }


        const params = new URLSearchParams();
        params.set('registryId', '2MSXVAPN0SUAA');
        params.set('giftIndex', '0');
        params.set('isPrimaryRegistrant', 'true');
        params.set('primaryOwnerCustomerId', 'A45579H563N1Z');
        params.set('gift', JSON.stringify(giftRequest.gift));
        params.set('registryShippingAddressId', 'A3R5EH9ZY1D1OZ');
        params.set('token', token);
        
        const request = new XMLHttpRequest();
        
        // Add event listener for response handling
        request.addEventListener('load', (_event) => {
          
          const element = document.createElement('div');
          element.innerHTML = request.response;

          const addressElement = Array.from(element.querySelectorAll('.br-tyl-item-details-address.a-section'))[0];
          const cleanAddress = element.querySelector('#br-tyl-gifter-address-0')
            .innerText
            .split(/\n?\s\s+?/g)
            .filter((y) => y.length > 0)
            .join(' ');
        
          const row = [gift.giftGiverName, gift.displayableGiftDate, gift.productTitle, cleanAddress];
          resolve(row);
        });
        
        // Open the request
        request.open('POST', 'https://www.amazon.com/baby-reg/thankyoulist/details');
        
        // Set headers (must be after `open`)
        request.withCredentials = true
        request.setRequestHeader('Referrer', 'https://www.amazon.com/baby-reg/thankyoulist/2MSXVAPN0SUAA?ref_=br_dsk_tbnr_ty');
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setRequestHeader('Accept', 'text/html,*/*');
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        
        // Send the request with properly encoded parameters
        request.send(params.toString());        
      }))

    const allResults = await Promise.all(itemQueryResults)

    const headerRows = ['Gift giver name', 'Date', 'Product', 'Address']
    const csvContent = `${headerRows.join(',')}\n` +
                allResults.map(rowDataList => rowDataList.join(',')).join('\n')

    const link = document.createElement('a')
    const csvData = new Blob([csvContent], { type: 'text/csv' })
    const csvUrl = URL.createObjectURL(csvData)

    link.setAttribute('href', csvUrl)
    link.setAttribute('download', 'gift_export.csv')
    document.body.appendChild(link)
    link.click()
  })

  document.querySelector('#br-tyl-heading > div > div.a-column.a-span10.a-text-right.a-spacing-none.a-span-last').appendChild(exportButton)
})()
