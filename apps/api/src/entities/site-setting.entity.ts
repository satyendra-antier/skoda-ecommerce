import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('site_settings')
export class SiteSetting {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'text' })
  value: string;
}
