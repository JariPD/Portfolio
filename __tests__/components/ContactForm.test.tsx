import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "@/components/ContactForm";

global.fetch = jest.fn();

describe("ContactForm — validatie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function submitEmptyForm() {
    render(<ContactForm />);
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));
  }

  test("Foutmelding bij ontbrekend naam", async () => {
    await submitEmptyForm();
    expect(
      screen.getByText(/please enter your name/i)
    ).toBeInTheDocument();
  });

  test("Foutmelding bij ontbrekend e-mailadres", async () => {
    await submitEmptyForm();
    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  test("Foutmelding bij ontbrekend bericht", async () => {
    await submitEmptyForm();
    expect(
      screen.getByText(/please enter your message/i)
    ).toBeInTheDocument();
  });

  test("Foutmelding bij ongeldig e-mailadres", async () => {
    render(<ContactForm />);

    await userEvent.type(screen.getByLabelText(/name/i), "Jan Jansen");
    await userEvent.type(screen.getByLabelText(/email/i), "geen-geldig-email");
    await userEvent.type(
      screen.getByLabelText(/message/i),
      "Dit is een testbericht met genoeg tekst."
    );
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("Geen fetch bij ongeldige invoer", async () => {
    await submitEmptyForm();
    expect(fetch).not.toHaveBeenCalled();
  });
});
