import React from "react";
import { SiKnowledgebase } from "react-icons/si";
import { RiShoppingCartLine } from "react-icons/ri";
import { TbRobot } from "react-icons/tb";
import { MdAccessibility } from "react-icons/md";

export default function Card() {
  return (
    <div className="mb-20 bg-white">
      <div className="flex justify-center ">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-wide border-b-4 ] inline-block pb-2">
          We Offer
        </h1>
      </div>
      <div className="flex justify-center px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Knowledge Sharing Card */}
          <div
            className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-lg 
                        text-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
          >
            <SiKnowledgebase className="text-4xl  mx-auto mb-3" />
            <h5 className="mb-2 text-2xl font-semibold text-gray-900">
              Knowledge Sharing
            </h5>
            <p className="text-gray-600">
              Articles & community-driven insights.
            </p>
          </div>

          {/* E-commerce Card */}
          <div
            className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-lg 
                        text-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
          >
            <RiShoppingCartLine className="text-4xl mx-auto mb-3" />
            <h5 className="mb-2 text-2xl font-semibold text-gray-900">
              E-commerce
            </h5>
            <p className="text-gray-600">Curated assistive products.</p>
          </div>

          {/* AI Assistance Card */}
          <div
            className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-lg 
                        text-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
          >
            <TbRobot className="text-4xl  mx-auto mb-3" />
            <h5 className="mb-2 text-2xl font-semibold text-gray-900">
              AI Assistance
            </h5>
            <p className="text-gray-600">
              Smart chatbot with verified medical resources.
            </p>
          </div>

          {/* Accessibility Features Card */}
          <div
            className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-lg 
                        text-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
          >
            <MdAccessibility className="text-4xl text-black mx-auto mb-3" />
            <h5 className="mb-2 text-2xl font-semibold text-gray-900">
              Accessibility Features
            </h5>
            <p className="text-gray-600">Text-to-Speech, alt text & more.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
