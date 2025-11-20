"use client";
import Image from "next/image";
import Link from "next/link";
import { FaBars } from "react-icons/fa6";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuSparkles } from "react-icons/lu";
import { GoArrowRight } from "react-icons/go";
import { LuSquareCheckBig } from "react-icons/lu";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { FiUsers } from "react-icons/fi";
import { FaRegChartBar } from "react-icons/fa";
import { TbBolt } from "react-icons/tb";
import { FaRegStar } from "react-icons/fa";
import { FiTarget } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { LuRocket } from "react-icons/lu";
import { FaArrowUp } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Home() {
  const [open, setOpen] = useState(false);
  const features = [
    {
      icon: HiOutlineRocketLaunch,
      title: "Lightning Fast",
      description:
        "Built for speed. Experience instant task updates and real-time collaboration that keeps pace with your team.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: FiUsers,
      title: "Team First",
      description:
        "Seamless collaboration tools that bring your team together. Comments, mentions, and shared workflows.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaRegChartBar,
      title: "Data-Driven",
      description:
        "Beautiful analytics that reveal insights. Make smarter decisions with powerful reporting and dashboards.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: TbBolt,
      title: "Smart Automation",
      description:
        "Let AI handle the boring stuff. Automated workflows that save hours every week.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: LuSquareCheckBig,
      title: "Flexible Views",
      description:
        "Board, list, or calendar - organize tasks your way. Multiple views for every work style.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: FaRegStar,
      title: "Premium Support",
      description:
        "We've got your back 24/7. Expert help whenever you need it, because your success is ours.",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const steps = [
    {
      number: 1,
      icon: HiOutlineRocketLaunch,
      title: "Sign Up",
      description:
        "Create your free account to get started. Customize your workspace and set up your personal dashboard where all your projects and tasks will live.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      number: 2,
      icon: FaRegStar,
      title: "Create Your Project",
      description:
        "Start by creating a new project and defining its goals, deadlines, and details. This will serve as the central hub for all your team’s tasks and progress tracking.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      number: 3,
      icon: FiUsers,
      title: "Invite Your Team",
      description:
        "Collaborate effortlessly by inviting team members to your project. Assign roles, share responsibilities, and keep everyone aligned in one organized space.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      number: 4,
      icon: FaRegChartBar,
      title: "Start Managing Tasks",
      description:
        "Break down work into manageable tasks, assign them to teammates, and monitor progress in real time. Stay productive and keep projects on track from start to finish.",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const faqs = [
    {
      question: "How do I create a project?",
      answer:
        "After signing in, click on the 'Create Project' button on your dashboard. Fill in your project name, description, and deadline to get started.",
    },
    {
      question: "Can I invite multiple team members?",
      answer:
        "Yes! You can invite as many team members as you need by sending them an invite link or adding their email addresses.",
    },
    {
      question: "How can I track task progress?",
      answer:
        "You can view task statuses in real-time. Tasks are organized by stages like 'To Do', 'In Progress', and 'Completed'.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. All user and project data are securely stored and encrypted to ensure privacy and protection.",
    },
    {
      question: "Can I update or delete a task after creating it?",
      answer:
        "Yes, you can easily edit task details, change assignees, or delete tasks anytime from your project dashboard.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative font-poppins">
      <nav
        id="hero"
        className={`fixed top-0 left-0 right-0 flex items-center justify-between px-4 md:px-10 py-3 shadow-lg z-50 bg-white transition-all duration-500 ${
          open ? "translate-y-2" : "translate-y-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-1">
          <Image
            src="/Copilot_20251014_120138.png"
            alt="logo"
            width={50}
            height={50}
          />
          <h1 className="font-bold text-lg md:text-2xl bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
            OpenTask
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:block">
          <ul className="flex items-center justify-center gap-6 text-sm">
            <li>
              <Link
                href="#features"
                // scroll={false}
                className="hover:text-[#9f00ff] transition-all duration-300"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#howitworks"
                className="hover:text-[#9f00ff] transition-all duration-300"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link
                href="#faq"
                // scroll={false}
                className="hover:text-[#9f00ff] transition-all duration-300"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>


        {/* Desktop Buttons */}
        <div className="text-xs gap-4 md:flex items-center justify-center  hidden">
          <Link href={"/Login"}>
            <button className="px-6 py-2.5 font-semibold border-1 border-gray-600 hover:cursor-pointer hover:bg-gray-200 rounded-lg">
              Log In
            </button>
          </Link>
          <Link href={"/SignUp"}>
            <button className="px-6 py-2.5 bg-gradient-to-tl from-[#9024ec] to-[#e2542c] hover:cursor-pointer rounded-lg text-white font-semibold">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="text-2xl p-2 rounded-md"
          >
            {open ? (
              <IoClose />
            ) : (
              <FaBars className="cursor-pointer" size={20} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu (behind navbar) */}
      <div
        className={`absolute top-0 left-0 w-full bg-white rounded-b-xl shadow-md flex flex-col p-4 pt-12 gap-6 md:hidden transition-all duration-500 ease-in-out z-5
        ${
          open
            ? "translate-y-14 opacity-100"
            : "-translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href="#features"
          className="hover:text-[#9F00FF] transition-all duration-300"
        >
          Features
        </Link>
        <Link
          href="#howitworks"
          className="hover:text-[#9F00FF] transition-all duration-300"
        >
          How It Works
        </Link>
        <Link
          href="#faq"
          className="hover:text-[#9F00FF] transition-all duration-300"
        >
          FAQ
        </Link>
        <div className="flex flex-col gap-2 text-sm w-full">
          <Link href={"/Login"}>
            <button className="w-full px-6 py-2.5 font-semibold border-1 rounded-lg border-gray-600 ">
              Log In
            </button>
          </Link>
          <Link href={"/SignUp"}>
            <button className="w-full px-6 py-2.5 bg-gradient-to-tl from-[#9F00FF] to-[#F2521E] rounded-lg text-white font-semibold">
              Get Started
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 md:px-10">
        <div className="flex items-center justify-center gap-2 text-[#9F00FF] px-4 py-2 border-1 mb-6 rounded-full w-fit bg-gradient-to-r from-[#9f00ff]/10 to-[#f2521e]/10 border-[#9f00ff]/20">
          <LuSparkles />
          <p className="text-center text-xs font-semibold bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
            Your next-generation task management platform
          </p>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Work Smarter,
            <br />
            <span className="relative inline-block z-0">
              <span className="bg-gradient-to-r from-[#9f00ff] via-[#f2521e] to-[#9f00ff] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Ship Faster
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 400 12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 6 Q100 0, 200 6 T400 6"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  fill="none"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#f900ff" />
                    <stop offset="100%" stopColor="#f2521e" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
        </div>
        <div className="text-center mb-6">
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            The all-in-one workspace where teams plan, collaborate, and deliver
            exceptional results. No complexity, just pure productivity.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-fit text-sm mb-18 md:mb-10">
          <Link href={"/SignUp"}>
            <button className="px-8 py-3 hover:cursor-pointer border-1 rounded-lg w-full md:w-fit flex items-center justify-center gap-2 hover:gap-4 transition-all duration-300 bg-gradient-to-r from-[#9024ec] to-[#e2542c] text-white font-semibold">
              Get Started Free <GoArrowRight />
            </button>
          </Link>
          <Link 
            href="#features"
          className="px-8 py-3 hover:cursor-pointer hover:bg-gray-200 border-1 rounded-lg w-full md:w-fit border-gray-600 font-semibold flex items-center justify-center">
            Explore Feature
          </Link>
        </div>
        <div className="w-full p-6 max-w-5xl rounded-xl border-1 shadow-[0_0_25px_#f900ff33,0_0_50px_#f2521e33] bg-white/20 backdrop-blur-md border-white/20">
          <div className="pb-3 border-b-1 border-[#eeeaef] w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 text-white rounded-xl text-lg bg-gradient-to-r from-[#9F00FF] to-[#F2521E]">
                <LuSquareCheckBig />
              </div>
              <div>
                <div className="h-3 w-32 mb-1.5 bg-gradient-to-r from-[#22222A]/80 to-[#22222A]/40 rounded-sm"></div>
                <div className="h-2 w-20 bg-[#F2F2F5] rounded-sm"></div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-[#F3E6FF]"></div>
              <div className="w-8 h-8 rounded-lg bg-[#F3E6FF]"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-[#f9f3fd]">
              <div className="flex items-center justify-between">
                <div className="w-16 h-2 rounded-full bg-gradient-to-r from-[#9f00ff] to-[#f2521e]"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff] to-[#f2521e]"></div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="w-full h-3 rounded-lg bg-[#ffffff]"></div>
                <div className="w-4/5 h-3 bg-[#ffffff] rounded-lg"></div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#f9f3fd]">
              <div className="flex items-center justify-between">
                <div className="w-16 h-2 rounded-full bg-gradient-to-r from-[#9f00ff] to-[#f2521e]"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff] to-[#f2521e]"></div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="w-full h-3 rounded-lg bg-[#ffffff]"></div>
                <div className="w-4/5 h-3 bg-[#ffffff] rounded-lg"></div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#f9f3fd]">
              <div className="flex items-center justify-between">
                <div className="w-16 h-2 rounded-full bg-gradient-to-r from-[#9f00ff] to-[#f2521e]"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff] to-[#f2521e]"></div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="w-full h-3 rounded-lg bg-[#ffffff]"></div>
                <div className="w-4/5 h-3 bg-[#ffffff] rounded-lg"></div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9f00ff]/30 to-[#f2521e]/30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Content */}
      <section
        id="features"
        className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 md:px-16"
      >
        <div className="flex items-center justify-center gap-2 text-[#9F00FF] px-4 py-2 border-1 mb-3 rounded-full w-fit bg-[#9f00ff]/10 border-[#9f00ff]/20">
          <HiArrowTrendingUp />
          <p className="text-center text-xs font-semibold text-[#9F00FF]">
            Features
          </p>
        </div>
        <div>
          <h1 className="text-center text-3xl md:text-6xl font-bold mb-3 leading-tight">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
              accomplish more
            </span>
          </h1>
        </div>
        <div>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto text-center">
            Powerful features that adapt to your workflow, not the other way
            around
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-500">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl p-8 border border-gray-200 hover:border-[#9f00ff]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#f900ff]/5 to-[#f2521e]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Content */}
      <section
        id="howitworks"
        className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 md:px-16 relative overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[700px] rounded-full blur-3xl" />
        </div>

        {/* Heading */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2 text-[#9F00FF] px-4 py-2 border mb-3 rounded-full w-fit bg-[#9f00ff]/10 border-[#9f00ff]/20">
            <FiTarget />
            <p className="text-xs font-semibold text-[#9F00FF]">How it Works</p>
          </div>
          <h1 className="text-3xl md:text-6xl font-bold mb-3 leading-tight">
            Get started in
            <br />
            <span className="bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
              four simple steps
            </span>
          </h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            From signup to productivity in minutes, not hours
          </p>
        </div>

        {/* Steps Section */}
        <div className="relative z-10 mt-14 w-full">
          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative overflow-visible h-full flex flex-col items-center text-center p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                {/* Step number */}
                <div className="w-12 h-12 rounded-full text-white absolute bg-gradient-to-br from-[#9F00FF] to-[#F2521E] font-bold flex items-center justify-center text-lg -top-6 -left-4">
                  {step.number}
                </div>
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-5 text-white text-2xl font-bold`}
                >
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-xs leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile Swiper */}
          <div className="lg:hidden w-full overflow-visible pt-10">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000 }}
              className="!overflow-visible"
            >
              {steps.map((step) => (
                <SwiperSlide key={step.number} className="!overflow-visible">
                  <div className="relative overflow-visible flex flex-col items-center text-center p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 bg-white/60 backdrop-blur-md">
                    {/* Step number */}
                    <div className="w-12 h-12 rounded-full text-white absolute bg-gradient-to-br from-[#9F00FF] to-[#F2521E] font-bold flex items-center justify-center text-lg -top-6 -left-2.5">
                      {step.number}
                    </div>
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-5 text-white text-2xl font-bold`}
                    >
                      <step.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section
        id="faq"
        className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 md:px-16"
      >
        <div className="flex items-center justify-center gap-2 text-[#9F00FF] px-4 py-2 border-1 mb-3 rounded-full w-fit bg-[#9f00ff]/10 border-[#9f00ff]/20">
          <FiTarget />
          <p className="text-center text-xs font-semibold text-[#9F00FF]">
            FAQ
          </p>
        </div>
        <div>
          <h1 className="text-center text-3xl md:text-6xl font-bold mb-3 leading-tight">
            Got questions?
            <br />
            <span className="bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
              We've got answers
            </span>
          </h1>
        </div>
        {/* <div><p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto text-center">From signup to productivity in minutes, not hours</p></div> */}
        <div className="max-w-3xl mx-auto space-y-4 mt-14">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl bg-white p-4 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full text-left"
              >
                <h3 className="text-base font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <FiChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`mt-2 text-gray-600 text-sm transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative flex items-center justify-center py-16 bg-gradient-to-t from-[#F2521E]/10 via-transparent to-[#9F00FF]/10 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[90%] md:w-[70%] h-80 bg-gradient-to-r from-[#9F00FF]/20 to-[#F2521E]/20 rounded-full blur-3xl" />
        </div>

        {/* Floating Card */}
        <div className="relative z-10 bg-white/80 backdrop-blur-2xl shadow-2xl rounded-3xl py-12 px-6 md:p-16 text-center max-w-5xl w-full mx-4 md:mx-10">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <LuRocket className="text-6xl md:text-7xl text-[#9f00ff]" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Ready to transform
            <br />
            <span className="bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
              your workflow?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            Be among the first to experience the future of task management.
            Start your free today no credit card required.
          </p>

          {/* CTA Button */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
            <Link 
              href={"/SignUp"}
            className="w-full hover:cursor-pointer md:w-fit text-sm px-10 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#9F00FF] to-[#F2521E] hover:opacity-90 transition-all duration-300 flex gap-2 items-center justify-center">
              Start Free
              <GoArrowRight />
            </Link>
            
          </div>
        </div>
      </section>
      <Link href="#hero" className="hidden lg:block">
        <div className="w-12 h-12 rounded-full bg-white shadow-2xl fixed right-8 top-140 flex items-center justify-center animate-bounce">
          <FaArrowUp className="" />
        </div>
      </Link>
    </div>
  );
}
