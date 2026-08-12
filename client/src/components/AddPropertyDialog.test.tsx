import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddPropertyDialog from "./AddPropertyDialog";

describe("AddPropertyDialog Virtual Tour & Video", () => {
  it("renders video and virtual tour input fields", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddPropertyDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/video pendek/i)).toBeTruthy();
    expect(screen.getByLabelText(/tur 360°/i)).toBeTruthy();
  });

  it("accepts valid virtual tour URL input", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddPropertyDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />);

    const tourInput = screen.getByLabelText(/tur 360°/i);
    fireEvent.change(tourInput, { target: { value: "https://my.matterport.com/show/?m=123" } });
    expect((tourInput as HTMLInputElement).value).toBe("https://my.matterport.com/show/?m=123");
  });

  it("handles video file selection and removal state", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddPropertyDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />);

    const fileInput = document.querySelector('input[type="file"][accept*="video"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const validVideo = new File(["dummy video content"], "tour.mp4", { type: "video/mp4" });
    fireEvent.change(fileInput, { target: { files: [validVideo] } });

    expect(screen.getByText("tour.mp4")).toBeTruthy();
    expect(screen.getByText("Hapus video terpilih")).toBeTruthy();

    const removeBtn = screen.getByText("Hapus video terpilih");
    fireEvent.click(removeBtn);

    expect(screen.queryByText("tour.mp4")).toBeNull();
  });
});
