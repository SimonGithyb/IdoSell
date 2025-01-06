const idosell = require('@api/idosell');
const { IDOSELL_API_KEY, IDOSELL_DOMAIN_URL } = process.env;

class IdosellSvc {
    constructor() {
        this.idosell = idosell;
        this.idosell.server("https://"+ IDOSELL_DOMAIN_URL +"/api/admin/v4/orders/orders/get");
        this.idosell.auth(IDOSELL_API_KEY); 

    }

    async getOrders(status) {
        return idosell.ordersOrdersGetPost({params: {ordersStatuses: [status]}})
            .then(({ data }) => data)
            .catch(err => console.error(err));
    }

    async getAllOrders() {
        return idosell.ordersOrdersGetPost({params: {shippmentStatus: 'all'}})
            .then(({ data }) => data)
            .catch(err => console.error(err));
    }

    async getOrdersFromSerialnumber(serialNumber) {
        return idosell.ordersOrdersGetPost({
            params: {ordersRange: {ordersSerialNumberRange: {ordersSerialNumberBegin: serialNumber}}}
          })
            .then(({ data }) => data)
            .catch(err => console.error(err));
    }
}

module.exports = new IdosellSvc();
