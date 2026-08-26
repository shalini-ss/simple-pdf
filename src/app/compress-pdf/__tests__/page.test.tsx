import { render, screen, fireEvent } from "@testing-library/react";
import CompressPdfPage from "../page";

describe("Compress PDF", () => {
  test("shows an error when an unsupported file is selected", () => {
    render(<CompressPdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["fake content"],
      "image.jpg",
      { type: "image/jpeg" }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.getByText("Please select a PDF file.")
    ).toBeInTheDocument();
  });

  test("adds a valid PDF file", () => {
    render(<CompressPdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["fake pdf content"],
      "document.pdf",
      { type: "application/pdf" }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(screen.getByText("document.pdf")).toBeInTheDocument();
  });
});