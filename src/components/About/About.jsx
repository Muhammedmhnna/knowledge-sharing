import React from "react";
import AboutPic from "../../assets/images/smiling-volunteers-helping-disabled-people-isolated-flat-illustration-cartoon-illustration_74855-14516.jpg";
export default function AboutUs() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-7xl w-full bg-white p-8 flex flex-col-reverse md:flex-row items-center gap-10 ">
        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={AboutPic}
            alt="About Us Illustration"
            className="max-w-md md:max-w-lg w-full h-auto mix-blend-multiply rounded-lg  transform hover:scale-105 transition duration-300"
          />
        </div>

        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900  tracking-wide border-b-4  inline-block pb-2">
            About Us
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            We are a team dedicated to transforming healthcare accessibility by
            providing knowledge, caregiving resources, and assistive tools,
            ensuring inclusivity for all. Our mission is to empower individuals,
            caregivers, and healthcare professionals through an accessible and
            user-friendly platform for learning, sharing, and connection.
          </p>
        </div>
      </div>
    </div>
  );
}
