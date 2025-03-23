import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { authenticate, getOrders } from "../shopify.server";
import { Page, Card, DataTable, Button } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const orders = await getOrders(admin);

  return { orders };
};

export default function OrdersPage() {
  const { orders } = useLoaderData<typeof loader>();

  const rows = orders.map(
    (order: {
      name: string;
      customer?: { firstName: string };
      totalPriceSet: {
        presentmentMoney: { amount: string; currencyCode: string };
      };
      createdAt: string;
    }) => [
      order.name,
      order.customer?.firstName || "Guest",
      `${order.totalPriceSet.presentmentMoney.amount} ${order.totalPriceSet.presentmentMoney.currencyCode}`,
      order.createdAt,
    ],
  );

  return (
    <Page
      title="Orders"
      primaryAction={
        <Link to="/app/orders/create">
          <Button variant="primary">Create Order</Button>
        </Link>
      }
    >
      <Card>
        <DataTable
          columnContentTypes={["text", "text", "numeric", "text"]}
          headings={["Order", "Customer", "Total Price", "Created At"]}
          rows={rows}
        />
      </Card>
    </Page>
  );
}
