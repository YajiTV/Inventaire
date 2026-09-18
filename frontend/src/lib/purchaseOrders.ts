import type { OrderLineRead, OrderStatus } from "../types/api";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    draft: "Brouillon",
    sent: "Envoyée",
    received: "Reçue",
    cancelled: "Annulée",
};

export function orderStatusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status];
}

export function lineTotal(line: OrderLineRead): number {
    return line.quantity * Number(line.unit_price);
}
