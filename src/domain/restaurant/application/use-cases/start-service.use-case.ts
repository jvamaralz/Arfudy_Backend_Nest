import { Injectable } from '@nestjs/common';
import { ServicesRepository } from '../repositories/services.repository';
import { TableInUseError } from './errors/table-in-use.error';
import { Service } from '../../enterprise/entities/service';
import { StartServiceRequestDto } from '@infra/http/dtos/start-service.request.dto';
import { UniqueEntityId } from '@core/entities/unique-entity-id';
import { UniqueToken } from '@core/entities/unique-token';
import { Client } from '../../enterprise/entities/value-objects/client';

export interface StartServiceUseCaseRequest extends StartServiceRequestDto {}

export interface StartServiceUseCaseResponse {
  service: Service;
}

@Injectable()
export class StartServiceUseCase {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async execute({
    tableToken,
    serviceToken,
    tableId,
    hasEnded,
    client,
  }: StartServiceUseCaseRequest): Promise<StartServiceUseCaseResponse> {
    const serviceExists =
      await this.servicesRepository.findByTableToken(tableToken);

    if (serviceExists)
      throw new TableInUseError(
        'Já existe um atendimento iniciado para o token fornecido',
      );

    client.isAdmin = client.isAdmin ?? true;
    const service: Service = Service.create({
      tableId: UniqueEntityId.createFromRawId(tableId),
      tableToken: UniqueToken.createFromRaw(tableToken),
      clients: [Client.create(client)],
      hasEnded,
      serviceToken: UniqueToken.createFromRaw(serviceToken),
    });

    await this.servicesRepository.create(service);

    return { service };
  }
}
