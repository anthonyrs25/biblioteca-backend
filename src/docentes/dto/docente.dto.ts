import { Type } from 'class-transformer'
import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'

export class CicloDto {
  @IsInt() @Min(1) @Max(4)
  numero!: number

  @IsArray() @IsString({ each: true })
  materias!: string[]

  @IsOptional() @IsIn(['matutino', 'vespertino', 'nocturno'])
  jornada?: string
}

export class CarreraConCiclosDto {
  @IsString() @IsNotEmpty()
  nombre!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CicloDto)
  ciclos!: CicloDto[]
}

export class CrearDocenteDto {
  @IsString() @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string

  @IsOptional() @IsString()
  iniciales?: string

  @IsOptional() @IsString()
  rfid?: string

  @IsOptional() @IsString()
  email?: string

  @IsOptional() @IsIn(['cedula', 'pasaporte'])
  tipoDocumento?: string

  @IsOptional() @IsString()
  numeroDocumento?: string

  @IsOptional() @IsIn(['usuario', 'bibliotecario', 'admin'])
  rol?: string

  @IsOptional() @IsIn(['DOCENTE', 'ESTUDIANTE', 'INVITADO', 'STAFF'])
  tipoPersona?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarreraConCiclosDto)
  carreras?: CarreraConCiclosDto[]
}

export class ActualizarDocenteDto {
  @IsOptional() @IsString()
  nombre?: string

  @IsOptional() @IsString()
  iniciales?: string

  @IsOptional() @IsString()
  rfid?: string

  @IsOptional() @IsIn(['cedula', 'pasaporte'])
  tipoDocumento?: string

  @IsOptional() @IsString()
  numeroDocumento?: string
}

export class ActualizarCiclosDto {
  @IsString() @IsNotEmpty()
  carrera!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CicloDto)
  ciclos!: CicloDto[]
}

export class AgregarCarreraDto {
  @IsString() @IsNotEmpty()
  carrera!: string
}

export class CambiarRolDto {
  @IsIn(['usuario', 'bibliotecario', 'admin'])
  rol!: string
}