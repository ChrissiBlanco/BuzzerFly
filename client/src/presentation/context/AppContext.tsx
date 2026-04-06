import { createContext, useContext, useMemo, type ReactNode } from "react";
import type {
  IRoomRepository,
  IRoundRepository,
  IQuestionRepository,
  IRoomSocket,
  IStorage,
} from "../../domain/repositories";
import {
  httpRoomRepository,
  httpRoundRepository,
  httpQuestionRepository,
  createSocketIoRoomSocket,
  localStorageAdapter,
} from "../../infrastructure/services";

export interface AppServices {
  roomRepository: IRoomRepository;
  roundRepository: IRoundRepository;
  questionRepository: IQuestionRepository;
  createRoomSocket: () => IRoomSocket;
  storage: IStorage;
}

const AppContext = createContext<AppServices | null>(null);

export function useAppServices(): AppServices {
  const services = useContext(AppContext);
  if (!services) {
    throw new Error("useAppServices must be used within AppServicesProvider");
  }
  return services;
}

const defaultServices: AppServices = {
  roomRepository: httpRoomRepository,
  roundRepository: httpRoundRepository,
  questionRepository: httpQuestionRepository,
  createRoomSocket: createSocketIoRoomSocket,
  storage: localStorageAdapter,
};

interface AppServicesProviderProps {
  children: ReactNode;
  /** Optional override for tests */
  services?: AppServices;
}

export function AppServicesProvider({
  children,
  services: servicesOverride,
}: AppServicesProviderProps) {
  const value = useMemo(
    () => servicesOverride ?? defaultServices,
    [servicesOverride]
  );
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
