import type { SendMessage } from "../../../src/domain/usecase/send-message";
import { SendMessageEvent } from "../../../src/presentation/events/send-message";
import type { Validation } from "../../../src/presentation/protocols/validation";
import { socketMock } from "../../mocks/socket";

const makeValidatorStub = (): Validation => {
  const validatorStub: Validation = {
    validate: jest.fn(),
  };

  return validatorStub;
};

const makeSendMessageStub = () => {
  const sendMessageStub: SendMessage = {
    send: jest.fn(),
  };

  return sendMessageStub;
};

const makeSut = () => {
  const validator = makeValidatorStub();
  const sendMessage = makeSendMessageStub();
  const sut = new SendMessageEvent(validator, sendMessage);

  return {
    sut,
    sendMessage,
    validator,
  };
};

const fakeData = {
  key: "fake-key",
  message: "message",
  userId: "userId",
  userName: "userName",
};

describe("SendMessage Event", () => {
  test("should return an Error if validator returns an Error", async () => {
    const { sut, validator } = makeSut();
    jest.spyOn(validator, "validate").mockReturnValue(new Error());

    await sut.handle(socketMock, fakeData);

    expect(socketMock.emit).toBeCalledWith("Error", new Error().message);
  });

  test("should call validator with correct values", async () => {
    const { sut, validator } = makeSut();
    await sut.handle(socketMock, fakeData);

    expect(validator.validate).toBeCalledWith(fakeData);
  });

  test("should call socket.emit with correct values", async () => {
    const { sut } = makeSut();

    await sut.handle(socketMock, fakeData);

    expect(socketMock.broadcast.to).toBeCalledWith(fakeData.key);
    /*     expect(socketMock.broadcast.to(fakeData.key).emit).toBeCalledWith(
      fakeData.key
    ); */
  });

  test("should call sendMessages with correct values", async () => {
    const { sut, sendMessage } = makeSut();

    await sut.handle(socketMock, fakeData);

    expect(sendMessage.send).toBeCalledWith(fakeData);
  });

  test("should emit an error when throws", async () => {
    const { sut, sendMessage } = makeSut();

    const err = new Error();
    jest.spyOn(sendMessage, "send").mockRejectedValue(new Error());

    await sut.handle(socketMock, fakeData);

    expect(socketMock.emit).toBeCalledWith("Error", err.message);
  });
});
