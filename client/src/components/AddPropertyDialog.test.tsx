import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import AddPropertyDialog from "./AddPropertyDialog";

afterEach(cleanup);

describe("AddPropertyDialog Virtual Tour & Video", () => {
  it("renders video, thumbnail, and virtual tour input fields", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddPropertyDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/video pendek/i)).toBeTruthy();
    expect(screen.getByLabelText(/thumbnail video/i)).toBeTruthy();
    expect(screen.getByLabelText(/tur 360°/i)).toBeTruthy();
  });

  it("accepts valid virtual tour URL input", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddPropertyDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />);

    const tourInput = screen.getByLabelText(/tur 360°/i);
    fireEvent.change(tourInput, { target: { value: "https://my.matterport.com/show/?m=123" } });
    expect((tourInput as HTMLInputElement).value).toBe("https://my.matterport.com/show/?m=123");
  });

  it("menyediakan pemilih foto yang bisa memilih hingga 5 file", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddPropertyDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />);

    const imageInput = document.querySelector('input[type="file"][multiple]') as HTMLInputElement | null;
    expect(imageInput).toBeTruthy();
    expect(imageInput?.multiple).toBe(true);
    expect(screen.getByText(/foto properti \(maksimal 5\)/i)).toBeTruthy();
    expect(screen.getByText(/klik untuk memilih foto/i)).toBeTruthy();
  });

  it("memproses 5 foto, mengubah foto utama, dan menghapus foto", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    let imageNumber = 0;
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 800, height: 600, close: vi.fn() }));
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(new Response("jpeg", { headers: { "Content-Type": "image/jpeg" } }))));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => {
      imageNumber += 1;
      return `data:image/jpeg;base64,${String(imageNumber).padStart(4, "0")}`;
    });

    render(<AddPropertyDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />);
    const imageInput = document.querySelector('input[type="file"][multiple]') as HTMLInputElement;
    const files = Array.from({ length: 5 }, (_, index) => new File([`image-${index}`], `rumah-${index + 1}.jpg`, { type: "image/jpeg" }));
    fireEvent.change(imageInput, { target: { files } });

    await waitFor(() => expect(screen.getAllByAltText(/Foto properti \d/)).toHaveLength(5));
    const previews = screen.getAllByAltText(/Foto properti \d/) as HTMLImageElement[];
    const secondPreviewSrc = previews[1].src;
    expect(screen.queryByText(/klik untuk memilih foto/i)).toBeNull();

    fireEvent.click(screen.getAllByRole("button", { name: /jadikan utama/i })[0]);
    await waitFor(() => expect((screen.getAllByAltText(/Foto properti \d/)[0] as HTMLImageElement).src).toBe(secondPreviewSrc));

    fireEvent.click(screen.getByRole("button", { name: /hapus foto 1/i }));
    await waitFor(() => expect(screen.getAllByAltText(/Foto properti \d/)).toHaveLength(4));
    expect(screen.getByText(/tersisa 1 slot/i)).toBeTruthy();

    fireEvent.change(imageInput, { target: { files: [new File(["extra-1"], "extra-1.jpg", { type: "image/jpeg" }), new File(["extra-2"], "extra-2.jpg", { type: "image/jpeg" })] } });
    await waitFor(() => expect(screen.getAllByAltText(/Foto properti \d/)).toHaveLength(4));
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

  it("menampilkan kontrol template SEO gratis di form admin", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AddPropertyDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />);

    expect(screen.getByRole("button", { name: /buat saran seo gratis/i })).toBeTruthy();
    expect(screen.getByLabelText(/nama properti/i)).toBeTruthy();
    expect(screen.getByLabelText(/deskripsi/i)).toBeTruthy();
  });

  it("menerapkan saran SEO lalu membiarkan admin mengedit hasilnya", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <AddPropertyDialog
        open={true}
        onOpenChange={() => {}}
        onSubmit={onSubmit}
        initialProperty={{
          id: 360001,
          title: "Gunawangsa Manyar 2BR",
          description: "Deskripsi lama",
          propertyType: "apartemen",
          transactionType: "dijual",
          price: "300000000",
          location: "Manyar, Surabaya",
          area: "36",
          bedrooms: "2",
          bathrooms: "1",
          condition: "furnished",
          images: [],
        }}
      />,
    );

    const seoButton = screen.getByRole("button", { name: /buat saran seo gratis/i });
    await waitFor(() => expect((seoButton as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(seoButton);

    const titleInput = screen.getByLabelText(/nama properti/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/deskripsi/i) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(titleInput.value).toBe("Dijual Apartemen Gunawangsa Manyar 2BR di Manyar, Surabaya | Primedeal");
      expect(descriptionInput.value).toContain("Gunawangsa Manyar 2BR di Manyar, Surabaya.");
    });

    fireEvent.change(titleInput, { target: { value: "Judul SEO yang diedit admin" } });
    expect(titleInput.value).toBe("Judul SEO yang diedit admin");
  });
});
