import { PurchaseTokensClient } from "./PurchaseTokensClient";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return <PurchaseTokensClient locale={locale} />;
}
