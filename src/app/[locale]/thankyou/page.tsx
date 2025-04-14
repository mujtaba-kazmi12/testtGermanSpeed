"use client";
import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, ArrowRight, Clock, ShoppingBag, Calendar, ArrowLeft, Mail, Home } from "lucide-react";
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';

// Create a client component that uses useSearchParams
function OrderContent() {
  const t = useTranslations('thankyou');
  const tNav = useTranslations('navigation');
  const tFooter = useTranslations('footer');
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  console.log("orderId", orderNumber);

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseTracked, setPurchaseTracked] = useState(false);

  // Trigger confetti when component mounts and not in loading/error state
  useEffect(() => {
    if (!loading && !error && orderDetails) {
      let burstCount = 0;
      const maxBursts = 3;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        if (burstCount >= maxBursts) {
          return clearInterval(interval);
        }

        // Create confetti with custom colors matching our theme
        confetti({
          particleCount: Math.floor(randomInRange(20, 50)),
          spread: randomInRange(50, 100),
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#d946ef', '#c026d3', '#a855f7'],
          disableForReducedMotion: true,
        });

        burstCount++;
      }, 500);

      return () => clearInterval(interval);
    }
  }, [loading, error, orderDetails]);

  // Track purchase event for GA4
  useEffect(() => {
    // Check if this order was already tracked in this session
    const sessionKey = `order_tracked_${orderNumber}`;
    const alreadyTracked = typeof window !== 'undefined' && 
      window.sessionStorage && 
      window.sessionStorage.getItem(sessionKey) === 'true';
    
    if (!loading && !error && orderDetails && !purchaseTracked && !alreadyTracked) {
      try {
        const orderData = orderDetails.items?.[0];
        
        if (orderData && typeof window !== 'undefined' && window.dataLayer) {
          // Debug what user data is available
          console.log("Available user data sources:", {
            billingDetails: orderData.billingDetails || "missing",
            customerDetails: orderData.customerDetails || "missing",
            customerEmail: orderData.customerEmail || "missing",
            user: orderData.user || "missing",
          });

          // Map products for GA4 ecommerce format
          const items = orderData.products?.map((product: any, index: number) => ({
            item_id: product.id || `product_${index}`,
            item_name: product.siteName || "Unlisted Product",
            item_category: Array.isArray(product.category) ? product.category[0] : (product.category || "Uncategorized"),
            price: parseFloat(product.adjustedPrice || "0"),
            quantity: 1,
            domain_authority: product.domainAuthority || product.da || 0,
            domain_rating: product.domainRatings || product.dr || 0,
            monthly_traffic: product.monthlyTraffic || 0,
            language: product.language || ""
          })) || [];

          // Extract user data with multiple fallbacks
          const userDataRaw = {
            firstName: orderData.billingDetails?.firstName || orderData.customerDetails?.firstName || orderData.user?.firstName || "",
            lastName: orderData.billingDetails?.lastName || orderData.customerDetails?.lastName || orderData.user?.lastName || "",
            email: orderData.billingDetails?.email || orderData.customerEmail || orderData.customerDetails?.email || orderData.user?.email || "",
            phoneNumber: orderData.billingDetails?.phoneNumber || orderData.customerDetails?.phoneNumber || orderData.user?.phoneNumber || "",
            city: orderData.billingDetails?.city || orderData.customerDetails?.city || orderData.user?.city || "",
            country: orderData.billingDetails?.country || orderData.customerDetails?.country || orderData.user?.country || "",
            postalCode: orderData.billingDetails?.postalCode || orderData.customerDetails?.postalCode || orderData.user?.postalCode || ""
          };
          
          // Filter out empty values
          const userData: Record<string, string> = {};
          Object.entries(userDataRaw).forEach(([key, value]) => {
            if (value && value.trim() !== "") {
              userData[key] = value;
            }
          });

          // Get any applied coupon code
          const couponCode = orderData.couponCode || orderData.discountCode || "";

          // Push purchase event to dataLayer (GA4 standard event)
          window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
          window.dataLayer.push({
            event: 'purchase',
            user_data: userData,
            ecommerce: {
              transaction_id: orderNumber,
              currency: orderData.currency || "EUR",
              value: parseFloat(orderData.totalAmount || "0"),
              tax: parseFloat(orderData.taxAmount || "0"),
              shipping: parseFloat(orderData.shippingAmount || "0"),
              coupon: couponCode,
              items: items
            }
          });
          
          console.log("🛒 Purchase event tracked with optimized structure:", {
            transaction_id: orderNumber,
            value: parseFloat(orderData.totalAmount || "0"),
            currency: orderData.currency || "EUR",
            items_count: items.length,
            user_data_fields: Object.keys(userData),
            coupon: couponCode || "none",
            user_data_sample: userData.email ? { email: userData.email } : {}
          });
          
          // Mark as tracked in both state and sessionStorage
          setPurchaseTracked(true);
          if (window.sessionStorage && orderNumber) {
            window.sessionStorage.setItem(sessionKey, 'true');
          }
        }
      } catch (err) {
        console.error("Error tracking purchase:", err);
      }
    }
  }, [loading, error, orderDetails, orderNumber, purchaseTracked]);

  useEffect(() => {
    if (orderNumber) {
      const fetchOrderDetails = async () => {
        try {
          const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
          const response = await fetch(`https://newbackend.crective.com/v1/order/?orderNumber=${orderNumber}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(t('errorFetch'));
          }

          const data = await response.json();
          setOrderDetails(data);
          console.log("Response", data);
        } catch (err: any) {
          setError(err.message || t('errorGeneric'));
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    } else {
      setError(t('errorNoDetails'));
      setLoading(false);
    }
  }, [orderNumber, t]);

  // Format date for better display
  const formatDate = (dateString: string) => {
    if (!dateString) return t('tableValueNotAvailable');
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-4xl bg-white/95 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-white/20">
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-xl"></div>
      <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 rounded-full blur-xl"></div>

      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-full flex items-center justify-center mb-4 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-violet-500/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          </div>
          <CheckCircle className="h-12 w-12 text-violet-600" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-2">{t('title')}</h1>
        <p className="text-slate-600 text-center text-lg max-w-md">{t('subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-slate-600">{t('loadingDetails')}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 w-full">
          <p className="text-red-700">{error}</p>
        </div>
      ) : orderDetails ? (
        <>
          <div className="w-full bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-lg p-6 mb-8 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shadow-sm">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
              <div className="ml-2"> {/* Adjust the left margin here */}
                <p className="text-sm font-medium text-slate-500">{t('statusLabel')}</p>
                <p className="font-semibold text-slate-800">
                  {orderDetails.items?.[0]?.orderStatus || t('tableValueNotAvailable')}
                </p>
              </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shadow-sm">
                  <Package className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{t('orderNumberLabel')}</p>
                  <p className="font-semibold text-slate-800">{orderNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shadow-sm">
                  <Calendar className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{t('orderDateLabel')}</p>
                  <p className="font-semibold text-slate-800">
                    {formatDate(orderDetails?.items?.[0]?.createdAt || new Date().toISOString())}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{t('totalAmountLabel')}</p>
                  <p className="font-semibold text-slate-800">
                    {orderDetails.items?.[0]?.totalAmount} {orderDetails.items?.[0]?.currency || "EUR"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full mb-8 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">{t('itemsTitle')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderProduct')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderCategory')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderLanguage')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('tableHeaderPrice')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {orderDetails.items?.[0]?.products?.map((product: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-violet-700">{index + 1}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{product.siteName}</span>
                            {product.websiteUrl && (
                              <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 hover:text-violet-800 truncate max-w-[200px]">
                                {product.websiteUrl.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {product.category ?
                            product.category.map((cat: string, i: number) => (
                              <span key={i} className="px-2 py-1 text-xs bg-violet-50 text-violet-700 rounded-full">{cat}</span>
                            )) :
                            <span className="text-slate-400">{t('tableValueNotAvailable')}</span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {product.language || t('tableValueNotAvailable')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-sm font-medium bg-green-50 text-green-700 rounded-full">
                          {product.adjustedPrice} {product.currency || "EUR"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              {t('continueShoppingButton')}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/user/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-violet-200 bg-white text-violet-600 rounded-full hover:bg-violet-50 transition-all w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              {tNav('dashboard')}
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 w-full text-center">
            <p className="text-sm text-slate-500">
              {t('confirmationEmailNotice')}
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <Link href="/" className="text-sm text-violet-600 hover:text-violet-800 flex items-center gap-1">
                <Home className="h-4 w-4" />
                {tNav('home')}
              </Link>
              <Link href="/contact" className="text-sm text-violet-600 hover:text-violet-800 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {tFooter('contact')}
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 w-full">
          <p className="text-amber-700">{t('errorNoDetails')}</p>
        </div>
      )}
    </div>
  );
}

// Loading fallback to display while suspense is active
function LoadingFallback() {
  const t = useTranslations('thankyou');
  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-4xl bg-white/95 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-white/20">
      <div className="w-24 h-24 bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-full flex items-center justify-center mb-8">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-600 border-t-transparent"></div>
      </div>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">{t('loadingTitle')}</h2>
      <p className="text-slate-500 text-center">{t('loadingSubtitle')}</p>
    </div>
  );
}

// Main page component with Suspense boundary
const ThankYou = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 to-fuchsia-50 flex justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),rgba(139,92,246,0.05))]"></div>

        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-grid-violet-500/[0.02]"></div>

        {/* Background decorative elements */}
        <div className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-violet-500/10 blur-3xl"></div>
        <div className="absolute top-[30%] right-[20%] w-72 h-72 rounded-full bg-fuchsia-600/10 blur-3xl"></div>
        <div className="absolute bottom-[15%] left-[30%] w-80 h-80 rounded-full bg-fuchsia-400/15 blur-3xl"></div>

        {/* Small decorative dots */}
        <div className="absolute top-[15%] right-[40%] w-4 h-4 rounded-full bg-violet-600 shadow-lg shadow-violet-500/30"></div>
        <div className="absolute top-[60%] left-[25%] w-4 h-4 rounded-full bg-fuchsia-600 shadow-lg shadow-fuchsia-500/30"></div>
        <div className="absolute bottom-[30%] right-[30%] w-4 h-4 rounded-full bg-violet-600 shadow-lg shadow-violet-500/30"></div>
        <div className="absolute top-[45%] left-[60%] w-3 h-3 rounded-full bg-fuchsia-600 shadow-lg shadow-fuchsia-500/30"></div>
        <div className="absolute bottom-[70%] right-[55%] w-3 h-3 rounded-full bg-violet-600 shadow-lg shadow-violet-500/30"></div>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <OrderContent />
      </Suspense>
    </div>
  );
};

export default ThankYou;
