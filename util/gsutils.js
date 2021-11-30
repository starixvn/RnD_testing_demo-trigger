const { GoogleSpreadsheet } = require('google-spreadsheet')
// const creds = require(('../cred/secret_key.json'))
const creds = require('../cred/secret_key.json')

const jp = require('jsonpath')

export const Doc = class {

    constructor(docID){
        this.doc = new GoogleSpreadsheet(docID)
    }
    async init() {
        await this.doc.useServiceAccountAuth(creds)
        await this.doc.loadInfo()
    }
    async getSheet(title) {
        this.sheet = await this.doc.sheetsByTitle[title]
    }

    async getColumnName() {
        return await this.sheet.loadHeaderRow()
    }

    async getRows(){ 
        this.rows = await this.sheet.getRows()
    }

    async insert(obj){
        await this.sheet.addRow(obj)
    }
    
    async inserts(obj){
        await this.sheet.addRows(obj)
    }

    async updateRows() {
        await this.rows.save()
    }
    
    async clearSheet() {
        await this.sheet.clear()
    }

    async setDefaultHeader() {
        await this.sheet.setHeaderRow("Coverage (%)")
    }

    async setcellvalue(x,y,_value) {
        await this.sheet.loadCells()
        const _cell = await this.sheet.getCell(x, y)
        _cell.value = _value
        await this.sheet.saveUpdatedCells()
    }

    async setcellvaluelink(x,y,_value,_link) {
        await this.sheet.loadCells()
        const _cell = await this.sheet.getCell(x, y)
        //_cell.value = _value
        _cell.formula= `=HYPERLINK("${_link}", "${_value}")`
        await this.sheet.saveUpdatedCells()
    }
    
    async insertRow(obj){
        const object = {
            "ProductId_RoundId" : obj.proId + "_" + obj.drawID,
            "Home" : obj.home,
            "Over" : obj.homeover,
            "Under" : obj.homeunder,
            "Away" : obj.away,
            "Odd" : obj.awayover,
            "Even" : obj.awayunder,
            "HT Home Result" : obj.home_ht_draw_result,
            "Sum HT Home Result" : obj.h_ht_sum,
            "HT Away Result" : obj.away_ht_draw_result,
            "Sum HT Away Result" : obj.a_ht_sum,
            "Sum Half Time" : obj.h_ht_sum + obj.a_ht_sum
        }
        await this.sheet.addRow(object)
    }
}
