"use client";

import React, { useState } from "react";

// Types
interface PackOption {
  id: string;
  label: string;
  price: number;
}

interface Product {
  title: string;
  brand: string;
  rating: number;
  ratingCount: number;
  flavour: string;
  highlights: string[];
  packOptions: PackOption[];
}

// Utility
function formatRs(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// Components
const ThumbnailGallery: React.FC<{
  thumbnails: string[];
  selectedImage: string;
  setSelectedImage: (img: string) => void;
}> = ({ thumbnails, selectedImage, setSelectedImage }) => (
  <div className="w-full md:w-20 flex md:flex-col items-center gap-3 overflow-auto">
    {thumbnails.map((t) => (
      <button
        key={t}
        onClick={() => setSelectedImage(t)}
        className={`border rounded-lg p-1 hover:shadow-md transition-all duration-150 ${
          selectedImage === t ? "ring-2 ring-green-400" : ""
        }`}
      >
        <img src={t} alt="thumb" className="w-16 h-16 object-cover rounded" />
      </button>
    ))}
  </div>
);

const ProductHighlights: React.FC<{ highlights: string[] }> = ({
  highlights,
}) => (
  <div className="mt-6">
    <h3 className="text-sm font-medium text-gray-800">Product highlights</h3>
    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
      {highlights.map((h, i) => (
        <li key={i}>{h}</li>
      ))}
    </ul>
  </div>
);

const PackSelector: React.FC<{
  packOptions: PackOption[];
  selectedPack: string;
  setSelectedPack: (id: string) => void;
}> = ({ packOptions, selectedPack, setSelectedPack }) => (
  <div className="mt-4">
    <div className="text-sm text-gray-700">Pack Size</div>
    <div className="mt-2 flex gap-3">
      {packOptions.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setSelectedPack(opt.id)}
          className={`border rounded-lg px-3 py-2 text-sm font-medium hover:shadow-sm transition ${
            selectedPack === opt.id
              ? "bg-red-50 border-red-300 text-red-700"
              : "bg-white text-gray-700"
          }`}
        >
          <div>{opt.label}</div>
          <div className="text-xs mt-1">{formatRs(opt.price)}</div>
        </button>
      ))}
    </div>
  </div>
);

const QuantitySelector: React.FC<{
  qty: number;
  setQty: (qty: number) => void;
}> = ({ qty, setQty }) => (
  <div className="flex items-center border rounded-md overflow-hidden">
    <button
      onClick={() => setQty(Math.max(1, qty - 1))}
      className="px-3 py-2 text-lg"
    >
      −
    </button>
    <div className="px-4 py-2 min-w-[44px] text-center">{qty}</div>
    <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-lg">
      +
    </button>
  </div>
);

const PriceBox: React.FC<{
  price: number;
  qty: number;
  addToCart: () => void;
}> = ({ price, qty, addToCart }) => (
  <div className="bg-gray-50 border rounded-lg p-4 shadow-sm sticky bottom-4 md:static">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">Price</div>
        <div className="text-2xl font-semibold text-gray-900">
          {formatRs(price)}
        </div>
        <div className="text-xs text-gray-400">Inclusive of all taxes</div>
      </div>
      <QuantitySelector qty={qty} setQty={() => {}} />
    </div>
    <div className="mt-4">
      <button
        onClick={addToCart}
        className="w-full bg-red-500 hover:bg-red-600 text-white rounded-md py-3 font-medium shadow"
      >
        Add to cart
      </button>
      <div className="mt-2 text-xs text-gray-500">
        <p>New GST benefit included in this MRP, may differ from label</p>
        <p>Not returnable • Read policy</p>
      </div>
    </div>
  </div>
);

// Main Page
export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(
    "/images/product-main.jpg"
  );
  const [qty, setQty] = useState(1);
  const [selectedPack, setSelectedPack] = useState("500g");

  const product: Product = {
    title:
      "Nutrabay Wellness All-Natural Plant Protein + Superfoods | For Muscles & Digestion | Gourmet Chocolate",
    brand: "Nutrabay Retail Pvt. Ltd.",
    rating: 4.3,
    ratingCount: 14,
    flavour: "Gourmet Chocolate",
    highlights: [
      "It may help in faster absorption of protein",
      "It is gluten and dairy-free",
      "It can help in managing appetite",
    ],
    packOptions: [
      { id: "500g", label: "500 gm Powder", price: 901 },
      { id: "1kg", label: "1 kg Powder", price: 1525 },
    ],
  };

  const thumbnails = [
    "/images/thumb-1.jpg",
    "/images/thumb-2.jpg",
    "/images/thumb-3.jpg",
    "/images/thumb-4.jpg",
  ];

  const price =
    product.packOptions.find((p) => p.id === selectedPack)?.price ??
    product.packOptions[0].price;

  const addToCart = () => {
    alert(`${product.title}\nAdded ${qty} × ${selectedPack} to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Gallery */}
          <div className="md:col-span-7 p-6 flex flex-col md:flex-row gap-6">
            <ThumbnailGallery
              thumbnails={thumbnails}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />
            <div className="flex-1 flex items-start justify-center">
              <div className="w-full max-w-lg">
                <img
                  src={selectedImage}
                  alt="product"
                  className="w-full h-auto rounded-lg object-contain shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="md:col-span-5 p-6 flex flex-col gap-6">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                {product.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                  {product.rating} ★
                </div>
                <div className="text-sm text-gray-600">
                  {product.ratingCount} Ratings
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-700">Flavour</div>
                <div className="mt-2 inline-block border rounded-md px-3 py-1 text-sm text-orange-800 bg-orange-50">
                  {product.flavour}
                </div>
              </div>
              <PackSelector
                packOptions={product.packOptions}
                selectedPack={selectedPack}
                setSelectedPack={setSelectedPack}
              />
              <ProductHighlights highlights={product.highlights} />
            </div>
            <PriceBox price={price} qty={qty} addToCart={addToCart} />
          </div>
        </div>
      </div>
    </div>
  );
}
