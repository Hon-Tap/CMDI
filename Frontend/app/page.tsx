"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  GraduationCap,
  ShieldCheck,
  Droplets,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">
      {/* ================================================= */}
      {/* HERO SECTION */}
      {/* ================================================= */}

      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/news/cmdi-edu.jpg"
          alt="CMDI Community Impact"
          fill
          priority
          className="object-cover scale-105"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-slate-950/70" />

        {/* Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 via-transparent to-blue-900/20" />

        {/* Animated Light Blur */}
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-32">
          <div className="max-w-4xl">

            {/* Label */}

            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white backdrop-blur-md">
              CMDI • South Sudan
            </span>

            {/* Heading */}

            <h1 className="mt-8 text-5xl font-black leading-[0.95] text-white md:text-7xl xl:text-8xl">
              Supporting
              <span className="block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Children.
              </span>

              Strengthening
              <span className="block">Communities.</span>
            </h1>

            {/* Description */}

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              Building brighter futures through education, child protection,
              healthcare, safe water, livelihoods, and community resilience
              across South Sudan.
            </p>

            {/* Buttons */}

            <div className="mt-12 flex flex-wrap gap-4">

              <Link
                href="/programs"
                className="group inline-flex items-center gap-3 rounded-full bg-cyan-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-500"
              >
                Explore Our Work

                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/donate"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
              >
                Support A Child
              </Link>

            </div>

            {/* Bottom Note */}

            <div className="mt-14 border-l-2 border-cyan-400 pl-5">
              <p className="max-w-lg text-sm uppercase tracking-[0.2em] text-slate-400">
                Working with children, families and communities to create
                lasting and sustainable change.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/60">
            <span className="text-xs uppercase tracking-[0.3em]">
              Scroll
            </span>

            <div className="flex h-10 w-6 justify-center rounded-full border border-white/30">
              <div className="mt-2 h-2 w-2 rounded-full bg-white animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* ABOUT PREVIEW SECTION */}
      {/* ================================================= */}

      <section className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Content */}

            <div className="max-w-xl">

              <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                About CMDI
              </span>

              <h2 className="mt-8 text-4xl font-black leading-tight text-slate-900 md:text-6xl">
                Creating opportunities for every child to thrive.
              </h2>

              <p className="mt-8 text-lg leading-relaxed text-slate-600">
                Children's Mission For Development Initiative (CMDI) works
                alongside vulnerable children, families and communities across
                South Sudan to improve wellbeing, strengthen resilience, and
                create sustainable opportunities for future generations.
              </p>

              {/* Highlights */}

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-cyan-600" />
                  <p className="text-slate-700">
                    Child-focused community development
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-cyan-600" />
                  <p className="text-slate-700">
                    Education, protection and healthcare initiatives
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-cyan-600" />
                  <p className="text-slate-700">
                    Sustainable impact through local partnerships
                  </p>
                </div>

              </div>

              <Link
                href="/about"
                className="group mt-10 inline-flex items-center gap-3 rounded-full bg-slate-900 px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800"
              >
                Discover Our Story

                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

            </div>

            {/* Image Side */}

            <div className="relative">

              {/* Background Shape */}

              <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-cyan-100 blur-3xl" />

              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />

              {/* Main Image */}

              <div className="relative overflow-hidden rounded-[36px] shadow-2xl">

                <Image
                  src="/images/about/story-image.jpeg"
                  alt="CMDI Community Work"
                  width={900}
                  height={900}
                  className="h-[650px] w-full object-cover transition duration-700 hover:scale-105"
                />

              </div>

              {/* Floating Card */}

              <div className="absolute -bottom-8 left-8 rounded-3xl border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-md">

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
                  Since 2022
                </p>

                <h3 className="mt-2 text-3xl font-black text-slate-900">
                  Community Driven
                </h3>

                <p className="mt-2 max-w-xs text-sm text-slate-600">
                  Building stronger communities through locally led
                  development and child-centered action.
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ================================================= */}
      {/* VISION • MISSION • GOAL */}
      {/* ================================================= */}

      <section className="relative overflow-hidden py-24">

        {/* Background Image */}

        <Image
          src="/images/cmdi-banner.jpg"
          alt="CMDI Banner"
          fill
          className="object-cover"
        />

        {/* Dark Overlay */}

        <div className="absolute inset-0 bg-slate-950/85" />

        {/* Gradient Overlay */}

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/60 via-slate-950/70 to-blue-950/60" />

        {/* Glow Effects */}

        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-6">

          {/* Header */}

          <div className="mx-auto max-w-2xl text-center">

            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300 backdrop-blur">
              Our Foundation
            </span>

            <h2 className="mt-6 text-4xl font-black text-white md:text-5xl">
              Guided By Purpose
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-300">
              A clear vision, a focused mission, and a strategic goal
              that guide every action we take for children and communities.
            </p>

          </div>

          {/* Timeline */}

          <div className="relative mx-auto mt-20 max-w-4xl">

            {/* Vertical Line */}

            <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-cyan-400 via-blue-400 to-emerald-400 lg:left-1/2 lg:-translate-x-1/2" />

            {/* Vision */}

            <div className="relative mb-10 flex items-start lg:justify-start">

              <div className="absolute left-5 top-10 h-4 w-4 -translate-x-1/2 rounded-full bg-cyan-400 ring-8 ring-cyan-400/10 lg:left-1/2" />

              <div className="ml-12 w-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:ml-0 lg:w-[44%]">

                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  Vision
                </span>

                <h3 className="mt-3 text-2xl font-bold text-white">
                  The Future We Envision
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  A South Sudan where every child grows up healthy,
                  educated, protected and empowered through resilient
                  communities and sustainable opportunities.
                </p>

              </div>

            </div>

            {/* Mission */}

            <div className="relative mb-10 flex items-start lg:justify-end">

              <div className="absolute left-5 top-10 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-400 ring-8 ring-blue-400/10 lg:left-1/2" />

              <div className="ml-12 w-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:ml-0 lg:w-[44%]">

                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                  Mission
                </span>

                <h3 className="mt-3 text-2xl font-bold text-white">
                  How We Create Change
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Empowering children and communities through education,
                  nutrition, protection, safe water and sustainable
                  development initiatives.
                </p>

              </div>

            </div>

            {/* Goal */}

            <div className="relative flex items-start lg:justify-start">

              <div className="absolute left-5 top-10 h-4 w-4 -translate-x-1/2 rounded-full bg-emerald-400 ring-8 ring-emerald-400/10 lg:left-1/2" />

              <div className="ml-12 w-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:ml-0 lg:w-[44%]">

                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                  Strategic Goal
                </span>

                <h3 className="mt-3 text-2xl font-bold text-white">
                  The Impact We Pursue
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Strengthening community resilience and child development
                  through quality services, peacebuilding and humanitarian
                  response.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* PROGRAMS PREVIEW SECTION */}
      {/* ================================================= */}

      <section className="bg-white py-32">
        <div className="mx-auto max-w-7xl px-6">

          {/* Header */}

          <div className="mx-auto max-w-3xl text-center">

            <span className="inline-flex rounded-full bg-cyan-50 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Our Programs
            </span>

            <h2 className="mt-6 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Programs That Transform Lives
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
              CMDI delivers integrated programs that improve wellbeing,
              strengthen resilience and create opportunities for vulnerable
              children, families and communities.
            </p>

          </div>

          {/* Program Grid */}

          <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {[
              {
                title: "Education",
                description: "Creating access to quality and inclusive learning."
              },
              {
                title: "Child Protection",
                description: "Protecting children from abuse and exploitation."
              },
              {
                title: "Healthcare",
                description: "Supporting healthier children and families."
              },
              {
                title: "WASH",
                description: "Safe water, sanitation and hygiene services."
              },
              {
                title: "Livelihoods",
                description: "Strengthening resilience and economic opportunities."
              },
              {
                title: "Emergency Response",
                description: "Delivering timely humanitarian assistance."
              }
            ].map((program, index) => (

              <Link
                key={index}
                href="/programs"
                className="group"
              >

                <article
                  className="
                    relative
                    h-full
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:border-cyan-200
                    hover:shadow-xl
                  "
                >

                  {/* Hover Accent */}

                  <div
                    className="
                      absolute
                      left-0
                      top-0
                      h-full
                      w-1
                      bg-cyan-600
                      scale-y-0
                      transition-transform
                      duration-500
                      group-hover:scale-y-100
                    "
                  />

                  <div className="relative">

                    <span className="text-xs font-bold tracking-[0.25em] text-cyan-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="mt-4 text-2xl font-black text-slate-900">
                      {program.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {program.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">

                      <span className="text-sm font-semibold text-slate-500">
                        Explore Program
                      </span>

                      <ArrowRight
                        size={18}
                        className="
                          text-cyan-700
                          transition-transform
                          duration-300
                          group-hover:translate-x-2
                        "
                      />

                    </div>

                  </div>

                </article>

              </Link>

            ))}

          </div>

          {/* Bottom CTA */}

          <div className="mt-16 text-center">

            <Link
              href="/programs"
              className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-8 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800"
            >
              Explore All Programs

              <ArrowRight size={18} />
            </Link>

          </div>

        </div>
      </section>

        {/* ================================================= */}
        {/* FIELD STORIES */}
        {/* ================================================= */}

        <section className="bg-slate-50 py-32">
        <div className="mx-auto max-w-7xl px-6">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

      <div className="max-w-3xl">

        <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
          Field Stories
        </span>

        <h2 className="mt-6 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
          Real Stories. Real Communities. Real Impact.
        </h2>

        <p className="mt-5 text-base leading-relaxed text-slate-600">
          Explore how CMDI is working alongside children, families and
          communities to create opportunities, strengthen resilience and
          build lasting change across South Sudan.
        </p>

      </div>

  <Link
    href="/news"
    className="inline-flex items-center gap-2 font-semibold text-cyan-700"
  >
    View All Stories
    <ArrowRight size={18} />
  </Link>

          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-12">

  {/* Featured Story */}

  <Link
    href="/news"
    className="group lg:col-span-7"
  >
    <article className="overflow-hidden rounded-[36px] bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

      <div className="relative h-[420px] overflow-hidden">

        <Image
          src="/images/news/cmdi-edu.jpg"
          alt="Education Support"
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
        />

      </div>

      <div className="p-8">

        <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
          Education
        </span>

        <h3 className="mt-4 text-3xl font-black leading-tight text-slate-900">
          Expanding Learning Opportunities For Children And Youth
        </h3>

        <p className="mt-4 max-w-2xl text-slate-600 leading-relaxed">
          CMDI supports access to education by creating learning
          opportunities that help children and young people develop
          knowledge, confidence and skills for a better future.
        </p>

        <div className="mt-6 flex items-center gap-3 font-semibold text-cyan-700">
          Discover The Story
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-2"
          />
        </div>

      </div>

    </article>
  </Link>

  {/* Side Stories */}

  <div className="space-y-8 lg:col-span-5">

    {/* Story Two */}

    <Link
      href="/news"
      className="group block"
    >
      <article className="overflow-hidden rounded-[30px] bg-white shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">

        <div className="grid md:grid-cols-[220px_1fr]">

          <div className="relative h-[220px]">

            <Image
              src="/images/news/cmdi-child.jpg"
              alt="Humanitarian Response"
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
            />

          </div>

          <div className="p-6">

            <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
              Humanitarian Response
            </span>

            <h3 className="mt-3 text-xl font-black text-slate-900">
              Supporting Children During Emergencies
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Responding to crises and climate-related challenges
              by supporting vulnerable children and families with
              timely assistance and protection.
            </p>

          </div>

        </div>

      </article>
    </Link>

    {/* Story Three */}

    <Link
      href="/news"
      className="group block"
    >
      <article className="overflow-hidden rounded-[30px] bg-white shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">

        <div className="grid md:grid-cols-[220px_1fr]">

          <div className="relative h-[220px]">

            <Image
              src="/images/news/cmd.jpg"
              alt="Community Development"
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
            />

          </div>

          <div className="p-6">

            <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
              Community Development
            </span>

            <h3 className="mt-3 text-xl font-black text-slate-900">
              Empowering Communities Through Local Leadership
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Working alongside local leaders, volunteers and youth
              to strengthen community participation and sustainable
              development initiatives.
            </p>

          </div>

        </div>

      </article>
    </Link>

  </div>

          </div>

        </div>
      </section>
        {/* ================================================= */}
        {/* JOIN OUR MISSION */}
        {/* ================================================= */}

        <section className="relative overflow-hidden py-36">

          {/* Background */}

          <div className="absolute inset-0 bg-gradient-to-br from-cyan-700 via-blue-700 to-slate-950" />

          <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-white/10 blur-[180px]" />

          <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-cyan-400/20 blur-[180px]" />

          <div className="relative mx-auto max-w-5xl px-6 text-center text-white">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
              Join Our Mission
            </span>

            <h2 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
              Together We Can Build
              <span className="block">
                A Better Future
              </span>
              For Every Child
            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-slate-200">
              Every contribution, partnership and act of support helps
              create opportunities for children and strengthens the
              communities they call home.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4">

              <Link
                href="/donate"
                className="rounded-full bg-white px-8 py-4 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-1"
              >
                Donate Now
              </Link>

              <Link
                href="/partner-with-us"
                className="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
              >
                Become A Partner
              </Link>

              <Link
                href="/volunteer"
                className="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
              >
                Volunteer
              </Link>

            </div>

          </div>

        </section>

    </main>
  );
}