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
    const itemQueryResults = Array.from(document.querySelectorAll('[data-a-modal]'))
      // The data-a-modal attribute contains a JSON string of data about the gift
      .map(result => {
        try {
          return JSON.parse(result.getAttribute('data-a-modal'))
        } catch (e) {
          return null
        }
      })
      // However, there exist some elements in the results that are not item rows
      // So we check for presence the `gift` attribute in the parsed data
      .filter(result => !!result && !!result.gift)
      // Map each item in to a request for the item's details
      .map(({ gift, registryId, index, isPrimaryRegistrant }) => new Promise((resolve, reject) => {
        const giftRequest = {
          gift,
          registryId,
          index,
          primaryRegistrant: isPrimaryRegistrant
        }

        const params = new URLSearchParams()
        params.set('giftRequest', JSON.stringify(giftRequest))
        params.set('token', token)

        const formData = new FormData()
        formData.append('giftRequest', JSON.stringify(giftRequest))
        formData.append('token', token)

        const request = new XMLHttpRequest()
        request.addEventListener('load', (_event) => {
          // The request returns HTML, so we add it to a virtual element
          const element = document.createElement('div')
          element.innerHTML = request.response
          // The address is stored in the second ([1]) result

          // START HERE -- Remove the words 'purchase address' from the element
          // instead of trying to parse the address
          const addressElement = Array.from(element.querySelectorAll('.br-tyl-details-wrapper .a-section'))[1]
          const cleanAddress = addressElement.innerText.split(/\n?\s\s+?/g).filter(y => y.length > 0).join(' ')

          if (!cleanAddress) {
            // This is okay; some people choose not to include their address
            console.warn('Could not find address elements', gift)
          }

          const row = [gift.giftGiverName, gift.displayableGiftDate, gift.productTitle, cleanAddress]
            // Wrap the data in quotes for the CSV export, since product titles and addresses
            // may contain a comma
            .map(data => `"${data}"`)

          return resolve(row)
        })

        request.open('POST', 'https://www.amazon.com/baby-reg/thankyoulist/detail?sif_profile=BabyRegistryThankYouList_NA')
        request.setRequestHeader('accept', 'text/html,*/*')
        request.setRequestHeader('content-type', 'application/x-www-form-urlencoded')
        request.setRequestHeader('downlink', '10')
        request.setRequestHeader('rtt', '0')
        request.setRequestHeader('x-requested-with', 'XMLHttpRequest')
        request.send(params.toString())
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
    document.body.appendChild(link) // Required for FF
    link.click()
  })

  document.querySelector('.baby-reg-tyl-heading div div.a-span2').appendChild(exportButton)
})()
