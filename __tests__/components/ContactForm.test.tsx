import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "@/components/ContactForm";

global.fetch = jest.fn();

describe("ContactForm — validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function submitEmptyForm() {
    render(<ContactForm />);
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));
  }

  test("shows an error when the name is missing", async () => {
    await submitEmptyForm();
    expect(
      screen.getByText(/please enter your name/i)
    ).toBeInTheDocument();
  });

  test("shows an error when the email is missing", async () => {
    await submitEmptyForm();
    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  test("shows an error when the message is missing", async () => {
    await submitEmptyForm();
    expect(
      screen.getByText(/please enter your message/i)
    ).toBeInTheDocument();
  });

  test("shows an error for an invalid email address", async () => {
    render(<ContactForm />);

    await userEvent.type(screen.getByLabelText(/name/i), "Jan Jansen");
    await userEvent.type(screen.getByLabelText(/email/i), "not-a-valid-email");
    await userEvent.type(
      screen.getByLabelText(/message/i),
      "This is a test message with enough text."
    );
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("does not call fetch on invalid input", async () => {
    await submitEmptyForm();
    expect(fetch).not.toHaveBeenCalled();
  });
});
