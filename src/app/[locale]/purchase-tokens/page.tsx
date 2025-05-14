import { PurchaseTokensClient } from "./PurchaseTokensClients";

export default function Page({ params }: { params: { locale: string } }) {
    return <PurchaseTokensClient locale={params.locale} />;
}
