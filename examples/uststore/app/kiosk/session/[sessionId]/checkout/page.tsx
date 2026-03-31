"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  ChevronLeft,
  Check,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

type PaymentMethod = "visa" | "mastercard" | "alipay" | "payme" | "wechatpay" | "octopus";

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

const PAYMENT_METHODS: PaymentOption[] = [
  {
    id: "visa",
    name: "Visa",
    icon: "💳",
    color: "#1A1F71",
    bgColor: "bg-[#1A1F71]/5 hover:bg-[#1A1F71]/10 border-[#1A1F71]/20",
    cardNumber: "4242 8888 1234 5678",
    cardExpiry: "12/28",
    cardCvv: "123",
  },
  {
    id: "mastercard",
    name: "Mastercard",
    icon: "💳",
    color: "#EB001B",
    bgColor: "bg-[#EB001B]/5 hover:bg-[#EB001B]/10 border-[#EB001B]/20",
    cardNumber: "5425 2334 3010 9903",
    cardExpiry: "06/27",
    cardCvv: "456",
  },
  {
    id: "alipay",
    name: "支付寶 AlipayHK",
    icon: "🅰️",
    color: "#1677FF",
    bgColor: "bg-[#1677FF]/5 hover:bg-[#1677FF]/10 border-[#1677FF]/20",
  },
  {
    id: "payme",
    name: "PayMe",
    icon: "📱",
    color: "#DB0011",
    bgColor: "bg-[#DB0011]/5 hover:bg-[#DB0011]/10 border-[#DB0011]/20",
  },
  {
    id: "wechatpay",
    name: "WeChat Pay",
    icon: "💬",
    color: "#07C160",
    bgColor: "bg-[#07C160]/5 hover:bg-[#07C160]/10 border-[#07C160]/20",
  },
  {
    id: "octopus",
    name: "八達通 Octopus",
    icon: "🐙",
    color: "#F58220",
    bgColor: "bg-[#F58220]/5 hover:bg-[#F58220]/10 border-[#F58220]/20",
  },
];

type Stage = "select" | "confirm" | "processing" | "success";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [stage, setStage] = useState<Stage>("select");
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Read product info from sessionStorage
  const productName =
    typeof window !== "undefined"
      ? sessionStorage.getItem("checkout_productName") || "HKUST 精品"
      : "HKUST 精品";
  const productPrice =
    typeof window !== "undefined"
      ? sessionStorage.getItem("checkout_productPrice") || "450"
      : "450";

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selected);
  const isCardPayment = selected === "visa" || selected === "mastercard";

  function handleSelectMethod(method: PaymentMethod) {
    setSelected(method);
    setStage("confirm");
  }

  function handlePay() {
    setStage("processing");
  }

  // Processing animation
  useEffect(() => {
    if (stage !== "processing") return;
    setProcessingProgress(0);
    const duration = 3000 + Math.random() * 2000; // 3-5 seconds
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setProcessingProgress(progress);
      if (elapsed >= duration) {
        clearInterval(timer);
        setStage("success");
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stage]);

  // Success stage
  if (stage === "success") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gradient-to-b from-green-50 to-white">
        <div className="flex flex-col items-center gap-6 max-w-md w-full px-6 animate-in fade-in zoom-in duration-500">
          {/* Success icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <div className="absolute -inset-3 rounded-full border-2 border-green-500/20 animate-ping" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">付款成功！</h2>
            <p className="text-gray-500">
              感謝您的購買，祝您有愉快的一天
            </p>
          </div>

          {/* Receipt card */}
          <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">商品</span>
              <span className="font-medium text-gray-800">{productName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">付款方式</span>
              <span className="font-medium text-gray-800">
                {selectedMethod?.icon} {selectedMethod?.name}
              </span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">
                合計
              </span>
              <span className="text-2xl font-bold text-ust-navy">
                HK${productPrice}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
              <ShieldCheck className="w-4 h-4" />
              交易編號: TXN-{sessionId.slice(0, 8).toUpperCase()}
            </div>
          </div>

          <Link
            href="/kiosk"
            className="w-full inline-flex items-center justify-center gap-2 bg-ust-navy text-white px-6 py-3.5 rounded-xl font-medium hover:bg-ust-navy-light transition-colors shadow-md text-base"
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  // Processing stage
  if (stage === "processing") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gradient-to-b from-white to-gray-50">
        <div className="flex flex-col items-center gap-8 max-w-sm w-full px-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#003366"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${processingProgress * 2.26} 226`}
                className="transition-all duration-100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-ust-navy" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-800">正在處理付款</h3>
            <p className="text-sm text-gray-400">
              請稍候，正在驗證您的付款...
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-ust-navy rounded-full transition-all duration-100"
              style={{ width: `${processingProgress}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            與 {selectedMethod?.name} 通訊中...
          </div>
        </div>
      </div>
    );
  }

  // Confirm stage (card form or mobile payment confirm)
  if (stage === "confirm" && selectedMethod) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-lg w-full px-6">
          {/* Back button */}
          <button
            onClick={() => {
              setStage("select");
              setSelected(null);
            }}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-ust-navy transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            選擇其他付款方式
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedMethod.icon}</span>
                <div>
                  <p className="font-bold text-gray-800">
                    {selectedMethod.name}
                  </p>
                  <p className="text-xs text-gray-400">安全支付</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">應付金額</p>
                <p className="text-xl font-bold text-ust-navy">
                  HK${productPrice}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {isCardPayment ? (
                <>
                  {/* Card number */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      卡號
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <CreditCard
                        className="w-5 h-5 shrink-0"
                        style={{ color: selectedMethod.color }}
                      />
                      <input
                        type="text"
                        value={selectedMethod.cardNumber}
                        readOnly
                        className="flex-1 bg-transparent text-gray-800 font-mono text-base tracking-wider outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {/* Expiry */}
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                        到期日
                      </label>
                      <input
                        type="text"
                        value={selectedMethod.cardExpiry}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-mono text-base outline-none"
                      />
                    </div>
                    {/* CVV */}
                    <div className="w-28">
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={selectedMethod.cardCvv}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-mono text-base outline-none"
                      />
                    </div>
                  </div>

                  {/* Cardholder */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      持卡人姓名
                    </label>
                    <input
                      type="text"
                      value="HKUST DEMO USER"
                      readOnly
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base outline-none"
                    />
                  </div>
                </>
              ) : (
                // Mobile payment
                <div className="flex flex-col items-center py-6 gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                      backgroundColor: `${selectedMethod.color}15`,
                    }}
                  >
                    <Smartphone
                      className="w-8 h-8"
                      style={{ color: selectedMethod.color }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-800">
                      {selectedMethod.name} 快捷支付
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      點擊下方按鈕確認付款
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 w-full text-center">
                    <p className="text-xs text-gray-400">帳戶</p>
                    <p className="font-mono text-gray-600 mt-0.5">
                      **** **** 8888
                    </p>
                  </div>
                </div>
              )}

              {/* Security notice */}
              <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                此為示範交易，不會產生實際扣款
              </div>
            </div>

            {/* Pay button */}
            <div className="px-6 pb-6">
              <button
                onClick={handlePay}
                className="w-full py-3.5 rounded-xl font-bold text-white text-base shadow-md transition-all active:scale-[0.98]"
                style={{ backgroundColor: selectedMethod.color }}
              >
                確認付款 HK${productPrice}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Select payment method stage
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-lg w-full px-6">
        {/* Back link */}
        <Link
          href={`/kiosk/session/${sessionId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-ust-navy transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          返回試穿結果
        </Link>

        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">商品</p>
              <p className="font-bold text-gray-800 text-lg">{productName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">應付金額</p>
              <p className="text-2xl font-bold text-ust-navy">
                HK${productPrice}
              </p>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 px-1">
            選擇付款方式
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => handleSelectMethod(method.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all active:scale-[0.97] ${method.bgColor}`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: method.color }}
                >
                  {method.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-300 text-center mt-6">
          🔒 此為 POC 示範，不會產生實際交易
        </p>
      </div>
    </div>
  );
}
