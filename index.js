const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

async function getPriceFeed() {
	try {
		const siteUrl = 'https://coinmarketcap.com/'

		const { data } = await axios({
			method: 'GET',
			url: siteUrl
		})

		const $ = cheerio.load(data)
		const elemSelector =
			'#__next > div > div.main-content > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div > div.tableWrapper___3utdq.cmc-table-homepage-wrapper___22rL4 > table > tbody > tr'

		const keys = [
			'rank',
			'name',
			'price',
			'24h',
			'7d',
			'marketCap',
			'volume',
			'circulatingSupply'
		]

		const coinArr = []

		$(elemSelector).each((parentIdx, parentElem) => {
			let keyIdx = 0
			const coinObj = {}

			if (parentIdx <= 13) {
				$(parentElem)
					.children()
					.each((childIdx, childElem) => {
						let tdValue = $(childElem).text()

						if (keyIdx === 1 || keyIdx === 6) {
							tdValue = $('p:first-child', $(childElem).html()).text()
						}

						if (tdValue) {
							coinObj[keys[keyIdx]] = tdValue

							keyIdx++
						}
					})

				coinArr.push(coinObj)
			}
		})
		return coinArr
	} catch (err) {
		console.error(err)
	}
}

const app = express()

app.get('/api/price-feed', async (req, res) => {
	try {
		const priceFeed = await getPriceFeed()

		return res.status(200).json({
			result: priceFeed
		})
	} catch (err) {
		return res.status(500).json({
			err: err.toString()
		})
	}
})

app.listen(3000, () => {
	console.log('Running on port 3000')
})
