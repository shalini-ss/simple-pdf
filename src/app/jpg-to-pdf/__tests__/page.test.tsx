import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JpgToPdfPage from "../page";

describe("JPG to PDF", () => {
  test("shows an error when an unsupported file is selected", () => {
    render(<JpgToPdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["test content"],
      "document.pdf",
      { type: "application/pdf" }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.getByText("Please select JPG or PNG images.")
    ).toBeInTheDocument();
  });

  test("clears all selected images", async () => {
  const user = userEvent.setup();

  render(<JpgToPdfPage />);

  const input = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;

  const file = new File(
    ["fake jpg content"],
    "photo.jpg",
    { type: "image/jpeg" }
  );

  await user.upload(input, file);

  expect(screen.getByText("photo.jpg")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Clear all" }));

  expect(screen.queryByText("photo.jpg")).not.toBeInTheDocument();
  expect(screen.queryByText("Selected images")).not.toBeInTheDocument();
});
});