import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RotatePdfPage from "../page";

const mockLoad = jest.fn();
const mockSave = jest.fn();
const mockGetPages = jest.fn();
const mockSetRotation = jest.fn();
const mockGetRotation = jest.fn();

jest.mock("pdf-lib", () => ({
  PDFDocument: {
    load: (...args: unknown[]) => mockLoad(...args),
  },
  degrees: (value: number) => value,
}));

describe("RotatePdfPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetRotation.mockReturnValue({
      angle: 0,
    });

    mockSetRotation.mockImplementation(() => {});

    mockSave.mockResolvedValue(
      new Uint8Array([1, 2, 3, 4])
    );

    mockGetPages.mockReturnValue([
      {
        setRotation: mockSetRotation,
        getRotation: mockGetRotation,
      },
      {
        setRotation: mockSetRotation,
        getRotation: mockGetRotation,
      },
    ]);

    mockLoad.mockResolvedValue({
      getPageCount: () => 2,
      getPages: mockGetPages,
      save: mockSave,
    });

    /*
     * jsdom's URL.createObjectURL can be read-only.
     * Do NOT assign to it directly here.
     *
     * The download test will mock it with jest.spyOn().
     */
  });

  test("renders Rotate PDF page", () => {
    render(<RotatePdfPage />);

    expect(
      screen.getByRole("heading", {
        name: "Rotate PDF",
        level: 1,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Add your PDF")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Choose PDF")
    ).toBeInTheDocument();
  });

  test("shows PDF file after uploading", async () => {
    const user = userEvent.setup();

    render(<RotatePdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["test pdf"],
      "sample.pdf",
      {
        type: "application/pdf",
      }
    );

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText("sample.pdf")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("2 pages")
    ).toBeInTheDocument();

    expect(
      screen.getByText("2 pages loaded.")
    ).toBeInTheDocument();
  });

  test("rejects non-PDF files", async () => {
    const user = userEvent.setup();

    render(<RotatePdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["test image"],
      "image.jpg",
      {
        type: "image/jpeg",
      }
    );

    await user.upload(input, file);

    expect(
      screen.getByText("Please select a PDF file.")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("image.jpg")
    ).not.toBeInTheDocument();
  });

  test("rotates a page to the right", async () => {
    const user = userEvent.setup();

    render(<RotatePdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["test pdf"],
      "sample.pdf",
      {
        type: "application/pdf",
      }
    );

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText("sample.pdf")
      ).toBeInTheDocument();
    });

    const rightButtons = screen.getAllByRole(
      "button",
      {
        name: "Right ↷",
      }
    );

    expect(rightButtons).toHaveLength(2);

    await user.click(rightButtons[0]);

    expect(
      screen.getByText("Rotation: 90°")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ready to rotate")
    ).toBeInTheDocument();
  });

  test("rotates a page to the left and can reset it", async () => {
    const user = userEvent.setup();

    render(<RotatePdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["test pdf"],
      "sample.pdf",
      {
        type: "application/pdf",
      }
    );

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText("sample.pdf")
      ).toBeInTheDocument();
    });

    const leftButtons = screen.getAllByRole(
      "button",
      {
        name: "↶ Left",
      }
    );

    expect(leftButtons).toHaveLength(2);

    await user.click(leftButtons[0]);

    expect(
      screen.getByText("Rotation: 270°")
    ).toBeInTheDocument();

    const resetButtons = screen.getAllByRole(
      "button",
      {
        name: "Reset",
      }
    );

    expect(resetButtons[0]).not.toBeDisabled();

    await user.click(resetButtons[0]);

    expect(
      screen.getByText("Rotation: 0°")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No pages rotated yet")
    ).toBeInTheDocument();
  });

  test("creates and downloads rotated PDF", async () => {
    const user = userEvent.setup();

    render(<RotatePdfPage />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(
      ["test pdf"],
      "sample.pdf",
      {
        type: "application/pdf",
      }
    );

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText("sample.pdf")
      ).toBeInTheDocument();
    });

    const rightButtons = screen.getAllByRole(
      "button",
      {
        name: "Right ↷",
      }
    );

    await user.click(rightButtons[0]);

    /*
     * IMPORTANT:
     * Use spyOn instead of direct assignment.
     */
    const createObjectURL = jest
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test");

    const revokeObjectURL = jest
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    const click = jest
      .spyOn(
        HTMLAnchorElement.prototype,
        "click"
      )
      .mockImplementation(() => {});

    const rotateButton = screen.getByRole(
      "button",
      {
        name: /Rotate PDF →/,
      }
    );

    expect(rotateButton).not.toBeDisabled();

    await user.click(rotateButton);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalled();
    });

    expect(mockSetRotation).toHaveBeenCalledWith(
      90
    );

    expect(
      createObjectURL
    ).toHaveBeenCalled();

    expect(
      click
    ).toHaveBeenCalled();

    expect(
      revokeObjectURL
    ).toHaveBeenCalledWith(
      "blob:test"
    );

    expect(
      screen.getByText(
        /Done! Rotated PDF downloaded/
      )
    ).toBeInTheDocument();

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    click.mockRestore();
  });
});