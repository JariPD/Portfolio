import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogPostForm from "@/components/BlogPostForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

global.fetch = jest.fn();

describe("BlogPostForm — validatie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Foutmelding bij leeg titel- én inhoudveld", async () => {
    render(<BlogPostForm authorEmail="test@test.com" />);

    await userEvent.click(screen.getByRole("button", { name: /submit post/i }));

    expect(
      screen.getByText("Title and content are required.")
    ).toBeInTheDocument();
  });

  test("Foutmelding bij leeg titelveld (inhoud ingevuld)", async () => {
    render(<BlogPostForm authorEmail="test@test.com" />);

    await userEvent.type(
      screen.getByPlaceholderText(/write your post here/i),
      "Some content here"
    );
    await userEvent.click(screen.getByRole("button", { name: /submit post/i }));

    expect(
      screen.getByText("Title and content are required.")
    ).toBeInTheDocument();
  });

  test("Foutmelding bij leeg inhoudveld (titel ingevuld)", async () => {
    render(<BlogPostForm authorEmail="test@test.com" />);

    await userEvent.type(
      screen.getByPlaceholderText(/give your post a title/i),
      "Some title"
    );
    await userEvent.click(screen.getByRole("button", { name: /submit post/i }));

    expect(
      screen.getByText("Title and content are required.")
    ).toBeInTheDocument();
  });

  test("Geen submit (fetch) mogelijk zolang velden leeg zijn", async () => {
    render(<BlogPostForm authorEmail="test@test.com" />);

    await userEvent.click(screen.getByRole("button", { name: /submit post/i }));

    expect(fetch).not.toHaveBeenCalled();
  });

  test("Geen submit (fetch) bij enkel een leeg inhoudveld", async () => {
    render(<BlogPostForm authorEmail="test@test.com" />);

    await userEvent.type(
      screen.getByPlaceholderText(/give your post a title/i),
      "My title"
    );
    await userEvent.click(screen.getByRole("button", { name: /submit post/i }));

    expect(fetch).not.toHaveBeenCalled();
  });
});
