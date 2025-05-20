"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface FAQItem {
    q: string;
    a: string;
}

export default function HelpPage() {
    const router = useRouter();
    const t = useTranslations("helpPage");

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Load localized FAQs as array
    const faqs: FAQItem[] = Array.from({ length: 10 }, (_, index) => ({
        q: t(`faqs.${index}.q`),
        a: t(`faqs.${index}.a`)
    }));

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white shadow-sm h-14 px-4">
                <button
                    onClick={() => router.back()}
                    className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <span className="text-xl">←</span>
                </button>
                <h1 className="text-lg font-semibold">{t("title")}</h1>
            </div>

            {/* FAQ Section */}
            <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
                {faqs.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md border border-gray-200"
                    >
                        <button
                            onClick={() => toggle(index)}
                            className="w-full text-left px-6 py-4 font-medium text-gray-800 flex justify-between items-center"
                        >
                            {item.q}
                            <span className="text-gray-500 text-xl">
                                {openIndex === index ? "−" : "+"}
                            </span>
                        </button>
                        {openIndex === index && (
                            <div className="px-6 pb-5 pt-1 text-sm text-gray-600">
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
