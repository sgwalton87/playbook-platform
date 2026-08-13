type ParseResult<TPayload> =
  | {
      ok: true;
      value: TPayload;
    }
  | {
      ok: false;
      error: string;
    };

export type StoreRedemptionPayload = {
  scholarId?: string;
  productId: string;
  coinPrice: number;
  shippingPayload?: Record<string, unknown>;
};

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseStoreRedemptionPayload(
  raw: unknown
): ParseResult<StoreRedemptionPayload> {
  if (!isObjectLike(raw)) {
    return { ok: false, error: "Invalid request body." };
  }

  const productId = trimString(raw.productId);
  if (!productId) {
    return { ok: false, error: "productId is required." };
  }

  if (typeof raw.coinPrice !== "number" || raw.coinPrice <= 0) {
    return { ok: false, error: "coinPrice must be a positive number." };
  }

  const scholarId = trimString(raw.scholarId) || undefined;
  const shippingPayload = isObjectLike(raw.shippingPayload)
    ? raw.shippingPayload
    : undefined;

  return {
    ok: true,
    value: {
      scholarId,
      productId,
      coinPrice: raw.coinPrice,
      shippingPayload,
    },
  };
}
