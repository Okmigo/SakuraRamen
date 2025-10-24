export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        const payload = JSON.parse(event.body || '{}');
        const { items = [], subtotal = 0, totalItems = 0, orderNote = '', submittedAt } = payload;

        if (!Array.isArray(items) || items.length === 0) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Cart is empty' })
            };
        }

        const sanitizedItems = items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            notes: item.notes || ''
        }));

        const orderPayload = {
            items: sanitizedItems,
            subtotal: Number(subtotal) || 0,
            totalItems: Number(totalItems) || sanitizedItems.reduce((sum, item) => sum + item.quantity, 0),
            orderNote,
            submittedAt: submittedAt || new Date().toISOString()
        };

        const webhookUrl = process.env.ORDER_WEBHOOK_URL;
        let forwarded = false;
        let webhookResponse = null;

        if (webhookUrl) {
            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });

                forwarded = response.ok;
                webhookResponse = {
                    status: response.status,
                    statusText: response.statusText
                };
            } catch (error) {
                console.error('Failed to forward order to webhook:', error);
            }
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                forwarded,
                webhookResponse,
                redirectUrl: 'https://order.sakuraramen208.com/'
            })
        };
    } catch (error) {
        console.error('Order forwarding error', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Unable to process order' })
        };
    }
};
