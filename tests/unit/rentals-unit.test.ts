import { date } from "joi";
import rentalsRepository from "repositories/rentals-repository";
import rentalsService from "services/rentals-service";
import { faker } from "@faker-js/faker"
import { makeFakeOpenRental, makeFakeOpenRentalWithMovies } from "../factories/rental-factory";
import { makeFakeAdultUser } from "../factories/user-factory";
import { makeFakeOpenMovie, makeFakeRentedMovie } from "../factories/movie-factory";
import usersRepository from "repositories/users-repository";
import moviesRepository from "repositories/movies-repository";

describe("Rentals Service Unit Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return rentals", async () => {

    const fakeRental = makeFakeOpenRental();

    jest.spyOn(rentalsRepository, "getRentals").mockImplementationOnce((): any => {
      return [fakeRental]
    });

    const rentals = await rentalsService.getRentals();

    expect(rentals).toHaveLength(1);
    expect(rentals).toEqual([
      {
        id: fakeRental.id,
        date: fakeRental.date,
        endDate: fakeRental.endDate,
        userId: fakeRental.userId,
        closed: fakeRental.closed
      }
    ]);
  })

  it("should return rental by id", async () => {

    const fakeRentalWithMovies = makeFakeOpenRentalWithMovies();

    jest.spyOn(rentalsRepository, "getRentalById").mockImplementationOnce((): any => {
      return fakeRentalWithMovies;
    })

    const rental = await rentalsService.getRentalById(fakeRentalWithMovies.id);

    expect(rental).toEqual({
      id: fakeRentalWithMovies.id,
      date: fakeRentalWithMovies.date,
      endDate: fakeRentalWithMovies.endDate,
      userId: fakeRentalWithMovies.userId,
      closed: fakeRentalWithMovies.closed,
      movies: [
        {
          id: expect.any(Number),
          name: expect.any(String),
          adultsOnly: expect.any(Boolean),
          rentalId: expect.any(Number)
        }
      ]
    });
  });

  it("should return error when rental not found", async () => {

    jest.spyOn(rentalsRepository, "getRentalById").mockImplementationOnce((): any => {
      return null;
    })

    const promise = rentalsService.getRentalById(1);

    expect(promise).rejects.toEqual({
      name: "NotFoundError",
      message: "Rental not found."
    });
  });

  it("should create a rental", async () => {
    //cria um usuário maior de idade
    const fakeAdultUser = makeFakeAdultUser();

    //cria um filme para ser alugado
    const fakeOpenMovie = makeFakeOpenMovie();

    //Mocka a busca de usuario para aluguel
    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return fakeAdultUser;
    });

    //Mocka a busca de usuario livre para locar
    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementationOnce((): any => {
      return [];
    });

    //Moacka a checaegm de filmes validos para locação
    jest.spyOn(moviesRepository, "getById").mockImplementationOnce((): any => {
      return fakeOpenMovie;
    });

    //Mocka a criação de um aluguel
    jest.spyOn(rentalsRepository, "createRental").mockImplementationOnce((): any => {
      return {
        id: faker.number.int(2),
        date: faker.date.past({ refDate: '2021-01-01T00:00:00.000Z' }),
        endDate: faker.date.future({ refDate: '2021-01-01T00:00:00.000Z' }),
        userId: fakeAdultUser.id,
        closed: false
      }
    });

    const rental = await rentalsService.createRental({
      userId: fakeAdultUser.id,
      moviesId: [fakeOpenMovie.id]
    });

    expect(rental).toEqual({
      id: expect.any(Number),
      date: expect.any(Date),
      endDate: expect.any(Date),
      userId: expect.any(Number),
      closed: expect.any(Boolean)
    });

  })

  it("should return error when user not found", async () => {
    const fakeAdultUser = makeFakeAdultUser();
    const fakeOpenMovie = makeFakeOpenMovie();

    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return null;;
    });

    const promise = rentalsService.createRental({
      userId: fakeAdultUser.id,
      moviesId: [fakeOpenMovie.id]
    });

    expect(promise).rejects.toEqual({
      name: "NotFoundError",
      message: "User not found."
    });

  });

  it("should return error when user has an open rental", async () => {
    const fakeAdultUser = makeFakeAdultUser();
    const fakeOpenMovie = makeFakeOpenMovie();

    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return fakeAdultUser;;
    });

    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementationOnce((): any => {
      return [makeFakeOpenRentalWithMovies()];
    });

    const promise = rentalsService.createRental({
      userId: fakeAdultUser.id,
      moviesId: [fakeOpenMovie.id]
    });

    expect(promise).rejects.toEqual({
      name: "PendentRentalError",
      message: "The user already have a rental!"
    });

  });

  it("should return error when movie already in rental", async () => {
    const fakeAdultUser = makeFakeAdultUser();
    const fakeRentedMovie = makeFakeRentedMovie();

    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return fakeAdultUser;;
    });

    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementationOnce((): any => {
      return [];
    });

    jest.spyOn(moviesRepository, "getById").mockImplementationOnce((): any => {
      return fakeRentedMovie;
    });

    const promise = rentalsService.createRental({
      userId: fakeAdultUser.id,
      moviesId: [fakeRentedMovie.id]
    });

    expect(promise).rejects.toEqual({
      name: "MovieInRentalError",
      message: "Movie already in a rental."
    });

  });
})
