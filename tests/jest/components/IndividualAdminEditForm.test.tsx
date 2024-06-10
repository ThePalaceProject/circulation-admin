import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IndividualAdminEditForm from "../../../src/components/IndividualAdminEditForm";
import renderWithContext from "../testUtils/renderWithContext";

describe("IndividualAdminEditForm", () => {
  it("clears the role checkboxes after save", async () => {
    const user = userEvent.setup();

    const contextProviderProps = {
      csrfToken: "",
      featureFlags: {},
      roles: [
        {
          role: "system",
        },
      ],
    };

    const props = {
      data: {
        allLibraries: [
          {
            name: "Alpha",
            short_name: "alpha",
            uuid: "a3247ce9-9639-426b-bb09-82e9cb4cf44b",
          },
          {
            name: "Beta",
            short_name: "beta",
            uuid: "da80cd40-7a87-41db-a789-5f1e87732aeb",
          },
          {
            name: "Gamma",
            short_name: "gamma",
            uuid: "15f32675-73f5-46f3-91f4-837b933bc7b1",
          },
        ],
      },
      disabled: false,
      listDataKey: "",
      urlBase: "",
    };

    const { rerender } = renderWithContext(
      <IndividualAdminEditForm {...props} />,
      contextProviderProps
    );

    const systemAdminCheckbox = screen.getByRole("checkbox", {
      name: /^system admin$/i,
    });

    const allAdminCheckbox = screen.getByRole("checkbox", {
      name: /^administrator$/i,
    });

    const allUserCheckbox = screen.getByRole("checkbox", {
      name: /^user$/i,
    });

    const alphaAdminCheckbox = screen.getByRole("checkbox", {
      name: /administrator of alpha/i,
    });

    const alphaUserCheckbox = screen.getByRole("checkbox", {
      name: /user of alpha/i,
    });

    const betaAdminCheckbox = screen.getByRole("checkbox", {
      name: /administrator of beta/i,
    });

    const betaUserCheckbox = screen.getByRole("checkbox", {
      name: /user of beta/i,
    });

    const gammaAdminCheckbox = screen.getByRole("checkbox", {
      name: /administrator of gamma/i,
    });

    const gammaUserCheckbox = screen.getByRole("checkbox", {
      name: /user of gamma/i,
    });

    expect(systemAdminCheckbox).not.toBeChecked();

    await user.click(systemAdminCheckbox);

    expect(systemAdminCheckbox).toBeChecked();

    expect(allAdminCheckbox).toBeChecked();
    expect(allUserCheckbox).toBeChecked();

    expect(alphaAdminCheckbox).toBeChecked();
    expect(alphaUserCheckbox).toBeChecked();

    expect(betaAdminCheckbox).toBeChecked();
    expect(betaUserCheckbox).toBeChecked();

    expect(gammaAdminCheckbox).toBeChecked();
    expect(gammaUserCheckbox).toBeChecked();

    const nextProps = {
      ...props,
      // Existence of the responseBody prop indicates that the form was just saved.
      responseBody: "some response",
    };

    rerender(<IndividualAdminEditForm {...nextProps} />);

    expect(systemAdminCheckbox).not.toBeChecked();

    expect(allAdminCheckbox).not.toBeChecked();
    expect(allUserCheckbox).not.toBeChecked();

    expect(alphaAdminCheckbox).not.toBeChecked();
    expect(alphaUserCheckbox).not.toBeChecked();

    expect(betaAdminCheckbox).not.toBeChecked();
    expect(betaUserCheckbox).not.toBeChecked();

    expect(gammaAdminCheckbox).not.toBeChecked();
    expect(gammaUserCheckbox).not.toBeChecked();
  });
});
