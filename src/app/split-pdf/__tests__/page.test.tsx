import { render, screen, fireEvent } from "@testing-library/react";
import SplitPdfPage from "../page";

describe("Split PDF", () => {
  test("shows an error when an unsupported file is selected", () => {
    render(<SplitPdfPage />);

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
});