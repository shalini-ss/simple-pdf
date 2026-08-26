import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MergePdfPage from "../page";


describe("Merge PDF", () => {
  test("shows an error when an unsupported file is selected", () => {
    render(<MergePdfPage />);

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
      screen.getByText("Please select PDF files only.")
    ).toBeInTheDocument();
  });
   test("adds a valid PDF file to the selected files", async () => {
    const user = userEvent.setup();

    render(<MergePdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["fake pdf content"],
      "document.pdf",
      { type: "application/pdf" }
    );

    await user.upload(input, file);

    expect(screen.getByText("Selected files")).toBeInTheDocument();
    expect(screen.getByText("1 file")).toBeInTheDocument();
    expect(screen.getByText("document.pdf")).toBeInTheDocument();
  });
  test("shows an error when trying to merge only one PDF", async () => {
  const user = userEvent.setup();

  render(<MergePdfPage />);

  const input = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;

  const file = new File(
    ["fake pdf content"],
    "document.pdf",
    { type: "application/pdf" }
  );

  await user.upload(input, file);

  const mergeButton = screen.getByRole("button", {
    name: /merge pdfs/i,
  });

  expect(mergeButton).toBeDisabled();
});
test("adds two valid PDF files to the selected files", async () => {
  const user = userEvent.setup();

  render(<MergePdfPage />);

  const input = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;

  const file1 = new File(
    ["fake pdf content 1"],
    "first.pdf",
    { type: "application/pdf" }
  );

  const file2 = new File(
    ["fake pdf content 2"],
    "second.pdf",
    { type: "application/pdf" }
  );

  await user.upload(input, [file1, file2]);

  expect(screen.getByText("Selected files")).toBeInTheDocument();
  expect(screen.getByText("2 files")).toBeInTheDocument();
  expect(screen.getByText("first.pdf")).toBeInTheDocument();
  expect(screen.getByText("second.pdf")).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /merge pdfs/i })
  ).not.toBeDisabled();
});
test("moves a PDF file down in the list", async () => {
  const user = userEvent.setup();

  render(<MergePdfPage />);

  const input = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;

  const file1 = new File(
    ["fake pdf content 1"],
    "first.pdf",
    { type: "application/pdf" }
  );

  const file2 = new File(
    ["fake pdf content 2"],
    "second.pdf",
    { type: "application/pdf" }
  );

  await user.upload(input, [file1, file2]);

  const downButtons = screen.getAllByRole("button", {
    name: "Move file down",
  });

  await user.click(downButtons[0]);

  const fileNames = screen.getAllByText(/\.pdf$/);

  expect(fileNames[0]).toHaveTextContent("second.pdf");
  expect(fileNames[1]).toHaveTextContent("first.pdf");
});
});
