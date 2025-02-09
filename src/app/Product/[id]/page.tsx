"use client";
import { useEffect, useState, useContext } from "react";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { CartContext } from "@/app/components/CartContext";

interface Product {
  _id: string;
  title: string;
  price: number;
  priceWithoutDiscount?: number;
  badge?: string;
  description: string;
  productImage: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
}

const ProductDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const cartContext = useContext(CartContext);
  const router = useRouter();

  if (!cartContext) {
    throw new Error(
      "CartContext is undefined. Ensure that CartProvider is wrapping the component."
    );
  }

  const { addToCart } = cartContext;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params; // ✅ Await the params if it's a Promise
        const productId = resolvedParams.id;

        const data = await client.fetch(
          `*[_type == "product" && _id == $id][0]{
            _id,
            title,
            price,
            priceWithoutDiscount,
            badge,
            description,
            productImage
          }`,
          { id: productId }
        );
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-lg text-gray-600 font-medium">
          Loading...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-500 font-medium">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Product Image */}
          <div className="relative group">
            <div className="aspect-square overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
              <img
                src={urlFor(product.productImage).url()}
                alt={product.title}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {product.badge && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-teal-100 text-teal-800">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="mt-10 lg:mt-0 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              {product.title}
            </h1>
            <div className="mt-6 flex items-center">
              <p className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </p>
              {product.priceWithoutDiscount && (
                <p className="ml-4 text-xl text-gray-500 line-through">
                  ${product.priceWithoutDiscount.toFixed(2)}
                </p>
              )}
              {product.priceWithoutDiscount && (
                <span className="ml-4 text-sm font-medium text-green-600">
                  Save $
                  {(product.priceWithoutDiscount - product.price).toFixed(2)}
                </span>
              )}
            </div>
            <p className="mt-8 text-lg leading-relaxed text-gray-600">
              {product.description}
            </p>

            <div className="mt-10 border-t border-gray-200 pt-10">
              <button
                onClick={() => {
                  addToCart({
                    id: product._id,
                    title: product.title,
                    price: product.price,
                    quantity: 1,
                    description: product.description,
                    imageUrl: urlFor(product.productImage).url(),
                  });
                  alert(`${product.title} has been added to your cart!`);
                }}
                className="w-full bg-teal-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Add to Cart
              </button>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Free shipping on all orders
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
