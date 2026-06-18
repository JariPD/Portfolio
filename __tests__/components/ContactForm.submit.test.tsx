import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "@/components/ContactForm";

global.fetch = jest.fn();

describe("ContactForm — submission & honeypot", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  async function fillValidForm() {
    await userEvent.type(screen.getByLabelText(/^name$/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/^email$/i), "jane@example.com");
    await userEvent.type(
      screen.getByLabelText(/^message$/i),
      "This is a sufficiently long message."
    );
  }

  test("posts the form body and shows the success state on a 200", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    render(<ContactForm />);

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" })
    );
    const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      website: "",
    });
  });

  test("surfaces the server error message when the request fails", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Too many requests. Please try again later." }),
    });
    render(<ContactForm />);

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
  });

  test("renders the honeypot field hidden and out of the tab order", () => {
    render(<ContactForm />);
    const honeypot = screen.getByLabelText(/website/i);
    expect(honeypot).toHaveAttribute("name", "website");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});
