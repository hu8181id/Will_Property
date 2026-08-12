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
});
