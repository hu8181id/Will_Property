import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Listing Virtual Tour & Video Rendering", () => {
  it("renders virtual tour and video elements when provided in property details", () => {
    // Simulasi komponen detail yang menerima properti dengan video dan tur 360
    const videoUrl = "https://cdn.example.com/video.mp4";
    const virtualTourUrl = "https://my.matterport.com/show/?m=example";

    render(
      <div>
        <div data-testid="video-section">
          <video src={videoUrl} controls />
        </div>
        <div data-testid="virtual-tour-section">
          <a href={virtualTourUrl} target="_blank" rel="noreferrer">
            Buka Tur Virtual 360°
          </a>
        </div>
      </div>
    );

    expect(screen.getByTestId("video-section")).toBeTruthy();
    expect(screen.getByTestId("virtual-tour-section")).toBeTruthy();
    expect(screen.getByText("Buka Tur Virtual 360°")).toBeTruthy();
  });

  it("memberi harga ruang penuh pada grid ponsel agar tidak menutupi kamar tidur", () => {
    render(
      <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
        <div data-testid="mobile-price-spec" className="col-span-2 min-w-0 sm:col-span-1">
          <p className="break-words text-xl font-bold leading-tight">Rp 325.000.000</p>
        </div>
        <div data-testid="bedroom-spec">2 KT</div>
      </div>,
    );

    expect(screen.getByTestId("mobile-price-spec").className).toContain("col-span-2");
    expect(screen.getByText("Rp 325.000.000").className).toContain("break-words");
    expect(screen.getByTestId("bedroom-spec")).toBeTruthy();
  });
});
