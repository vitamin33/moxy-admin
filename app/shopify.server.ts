import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

// ORDERS
type NodeResponse = {
  node: {
    id: string;
    name: string;
    totalPriceSet: {
      presentmentMoney: {
        amount: string;
        currencyCode: string;
      };
    };
    customer?: {
      firstName: string;
    };
    createdAt: string;
  };
};
export const getOrders = async (admin: any) => {
  const query = `
    {
      orders(first: 10) {
        edges {
          node {
            id
            name
            totalPriceSet {
              presentmentMoney {
                amount
                currencyCode
              }
            }
            customer {
              firstName
            }
            createdAt
          }
        }
      }
    }
  `;

  try {
    // Send the GraphQL query
    const response = await admin.graphql(query);

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON from the response
    const data = await response.json();

    // Log the parsed data for debugging
    console.log("Parsed Response JSON:", data);

    // Access the orders data
    return data.data.orders.edges.map(
      (edge: { node: NodeResponse }) => edge.node,
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};
