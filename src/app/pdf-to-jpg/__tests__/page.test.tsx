import { render, screen, fireEvent } from "@testing-library/react";
import PdfToJpgPage from "../page";

describe("PDF to JPG", () => {
  test("shows an error when an unsupported file is selected", () => {
    render(<PdfToJpgPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["fake image content"],
      "photo.jpg",
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
});